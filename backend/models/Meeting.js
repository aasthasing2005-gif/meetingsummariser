 const mongoose = require('mongoose');
 const Schema = new mongoose.Schema({
 title: String,
 transcript: String,
 source: String,
 date: String,
 summary: String,
 actionItems: [String],
 importantImages: [String],
 urgencyScore: Number,
 status: {type: String, default: 'processing'}
 },{timestamps:true});
 module.exports = mongoose.model('Meeting', Schema);