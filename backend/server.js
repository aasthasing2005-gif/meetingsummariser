require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');
const Meeting = require('./models/Meeting');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes with Error Handling
app.post('/api/saveTranscript', async (req, res) => {
  try {
    const { transcript, source, date } = req.body;
    const m = new Meeting({ transcript, source, date, status: 'processing' });
    await m.save();

    const py = spawn('python3', [
      path.join(__dirname, '../worker/process_meeting.py'),
      m._id.toString()
    ]);

    py.stdout.on('data', (d) => console.log('py:', d.toString()));
    py.stderr.on('data', (d) => console.error('py-err:', d.toString()));

    res.json({ ok: true, id: m._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

 app.get('/api/lastSummary', async (req,res)=>{
 const last = await Meeting.findOne().sort({createdAt:-1});
 res.json(last||{});
 });


 app.get('/api/allMeetings', async (req,res)=>{
 const all = await Meeting.find().sort({createdAt:-1});
 res.json(all);
 });

 app.get('/api/meeting/:id', async (req,res)=>{ const m = await
 Meeting.findById(req.params.id); res.json(m||{}); });

 app.post('/api/updateLast', async (req,res)=>{
 const last = await Meeting.findOne().sort({createdAt:-1});
 if (!last) return res.json({error:'no meeting'});
 const { title, date } = req.body;
 last.title = title || last.title;
 last.date = date || last.date;
 await last.save();
 res.json({ok:true});
 });

 app.delete('/api/meeting/:id', async (req,res)=>{ await
 Meeting.deleteOne({_id:req.params.id}); res.json({ok:true}); });

 app.listen(5000, ()=> console.log('Server running on http://localhost:5000'));