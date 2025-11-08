import React from "react";

/**
 * SummaryView Component
 * Displays detailed information about a specific meeting summary.
 * Props:
 *  - meeting: meeting object (contains title, summary, actionItems, etc.)
 *  - onDelete: function to delete a meeting
 */

export default function SummaryView({ meeting, onDelete }) {
  if (!meeting || !meeting.summary) {
    return (
      <div className="card">
        <p style={{ color: "#6b7280" }}>No summary available yet.</p>
      </div>
    );
  }

  const { _id, title, date, summary, actionItems, importantImages, urgencyScore } = meeting;

  return (
    <div className="card summary-view">
      <h3>{title || "Untitled Meeting"}</h3>
      <p className="meta">
        {date ? new Date(date).toLocaleString() : "Date not available"}
      </p>

      <p className="summary-text">{summary}</p>

      {importantImages && importantImages.length > 0 && (
        <>
          <h4>📸 Important Images</h4>
          <div className="images">
            {importantImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Important ${i + 1}`}
                className="thumb"
              />
            ))}
          </div>
        </>
      )}

      {actionItems && actionItems.length > 0 && (
        <>
          <h4>📝 Action Items</h4>
          <ul className="action-list">
            {actionItems.map((a, i) => (
              <li key={i} className="action-item">
                <span>{typeof a === "string" ? a : a.text}</span>
                {a.owner && <span className="owner"> — {a.owner}</span>}
                {a.due && (
                  <span className="due">
                    ⏰ Due: {new Date(a.due).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="urgency">
        <strong>Urgency Score:</strong>{" "}
        <span
          style={{
            color:
              urgencyScore > 7
                ? "red"
                : urgencyScore > 4
                ? "orange"
                : "green",
          }}
        >
          {urgencyScore ? urgencyScore.toFixed(2) : "0.00"}
        </span>
      </div>

      <button className="delete-btn" onClick={() => onDelete(_id)}>
        🗑️ Delete Summary
      </button>
    </div>
  );
}
