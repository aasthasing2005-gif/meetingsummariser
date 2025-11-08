import React, { useEffect, useState } from "react";
import axios from "axios";
import MeetingCard from "./components/MeetingCard";
import MeetingList from "./components/MeetingList";
import SummaryView from "./components/SummaryView";
import "./styles.css";

const API = "http://localhost:5000/api";

export default function App() {
  const [latest, setLatest] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const fetchAll = async () => {
    const [last, all] = await Promise.all([
      axios.get(`${API}/lastSummary`),
      axios.get(`${API}/allMeetings`)
    ]);
    setLatest(last.data);
    setMeetings(all.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    await axios.post(`${API}/updateLast`, { title, date });
    const last = await axios.get(`${API}/lastSummary`);
    const m = last.data;
    if (m._id && date) {
      chrome.runtime.sendMessage({
        type: "scheduleDeadline",
        meetingId: m._id,
        deadlineISO: date,
      });
    }
    fetchAll();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/meeting/${id}`);
    fetchAll();
  };

  return (
    <div className="app">
      <h1>MeetGist</h1>
      <p className="tagline">AI Meeting Summaries</p>

   {latest && <SummaryView meeting={latest} onDelete={handleDelete} />}


      <div className="form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" />
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={handleSave}>Save & Schedule</button>
      </div>

      <MeetingList meetings={meetings} onDelete={handleDelete} />
    </div>
  );
}
