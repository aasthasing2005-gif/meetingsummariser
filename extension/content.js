
// content.js — injected into Google Meet
console.log("✅ MeetGist content script active on", window.location.href);

// Function to capture captions or spoken text
function captureCaptions() {
  const captions = [];
  const nodes = document.querySelectorAll('[class*="caption"], [data-self-name]');
  nodes.forEach(node => {
    const text = node.innerText?.trim();
    if (text && !captions.includes(text)) {
      captions.push(text);
    }
  });
  return captions.join(" ");
}

// Detect when the user leaves the meeting (tab close or refresh)
window.addEventListener("beforeunload", async () => {
  const transcript = captureCaptions();

  if (transcript.length > 0) {
    const meetingData = {
      title: "Google Meet Session",
      transcript,
      date: new Date().toISOString(),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    };

    console.log("📤 Sending meeting data to backend:", meetingData);

    try {
      const response = await fetch("http://localhost:5000/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      console.log("✅ Meeting saved:", result);

      // Notify background script
      chrome.runtime.sendMessage({ type: "MEETING_SAVED", data: result });

    } catch (error) {
      console.error("❌ Error saving meeting:", error);
    }
  } else {
    console.log("⚠️ No transcript found — skipping save");
  }
});
