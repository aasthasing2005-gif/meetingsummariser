export default function MeetingCard({ data, onDelete }) {
  if (!data || !data.summary) return <p>No summary yet</p>;
  return (
    <div className="card">
      <h3>{data.title || "Untitled Meeting"}</h3>
      <p className="meta">{new Date(data.date).toLocaleString()}</p>
      <p>{data.summary}</p>
      <div className="images">
        {(data.importantImages || []).map((url, i) => (
          <img key={i} src={url} alt="img" className="thumb" />
        ))}
      </div>
      <h4>Action Items</h4>
      <ul>{(data.actionItems || []).map((a, i) => <li key={i}>{a}</li>)}</ul>
      <p className="meta">Urgency: {data.urgencyScore?.toFixed(2) || 0}</p>
      <button onClick={() => onDelete(data._id)}>Delete</button>
    </div>
  );
}
