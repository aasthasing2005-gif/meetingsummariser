// background.js — MeetGist Chrome Extension (Manifest V3)

// Fired when the extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ MeetGist background service worker loaded successfully");
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveMeeting") {
    console.log("📝 Received meeting data from content script:", message.data);

    // Send meeting data to backend (Node.js API)
    fetch("http://localhost:5000/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("✅ Meeting saved to backend:", data);

        // Respond to the sender (content.js or popup)
        sendResponse({ success: true, meetingId: data._id });

        // Schedule a notification reminder (if meeting has a deadline)
        if (data.deadline) {
          scheduleDeadlineNotification(data);
        }

        // Show confirmation notification immediately
        showNotification("📋 Meeting Saved", `${data.title} has been saved successfully.`);
      })
      .catch(err => {
        console.error("❌ Error saving meeting:", err);
        sendResponse({ success: false });
        showNotification("⚠️ Error", "Failed to save meeting data. Check your backend.");
      });

    // Return true to indicate an async response
    return true;
  }

  // Manual trigger from popup (if needed)
  if (message.type === "notifyDeadline") {
    showNotification(message.title, message.text);
  }
});

// ------------------------------------------------------------------
// Function: Show Chrome notification
// ------------------------------------------------------------------
function showNotification(title, text) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon.png",
    title,
    message: text,
    priority: 2,
  });
}

// ------------------------------------------------------------------
// Function: Schedule a reminder before meeting deadline
// ------------------------------------------------------------------
function scheduleDeadlineNotification(meeting) {
  try {
    const deadline = new Date(meeting.deadline);
    const reminder = new Date(deadline.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    const now = new Date();

    if (reminder > now) {
      const delay = reminder.getTime() - now.getTime();
      chrome.alarms.create(meeting._id, { when: Date.now() + delay });
      console.log("⏰ Reminder scheduled for:", reminder.toLocaleString());
    } else {
      console.warn("⚠️ Reminder time is in the past. Skipping scheduling.");
    }
  } catch (err) {
    console.error("❌ Failed to schedule reminder:", err);
  }
}

// ------------------------------------------------------------------
// Listener: Triggered when a scheduled alarm goes off
// ------------------------------------------------------------------
chrome.alarms.onAlarm.addListener(alarm => {
  console.log("🔔 Alarm triggered for meeting:", alarm.name);

  fetch(`http://localhost:5000/api/meetings/${alarm.name}`)
    .then(res => res.json())
    .then(meeting => {
      showNotification("📅 Upcoming Meeting Reminder", `Reminder: ${meeting.title} is tomorrow.`);
    })
    .catch(err => {
      console.error("❌ Failed to fetch meeting for reminder:", err);
    });
});
