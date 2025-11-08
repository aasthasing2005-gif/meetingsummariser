export default function MeetingList({ meetings, onDelete }) {
  return (
    <div className="list">
      <h3>Previous Meetings</h3>
      {meetings.map((m) => (
        <div key={m._id} className="list-item">
          <div>
            <b>{m.title || "Untitled"}</b>
            <p className="meta">{new Date(m.date || m.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => onDelete(m._id)}>🗑️</button>
        </div>
      ))}
    </div>
  );
}
