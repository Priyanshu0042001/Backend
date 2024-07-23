//DATABASE SCHEMA FOR NOTES SCHEMA
const mongoose=require('mongoose');
const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  }, { timestamps: true });
  
  const Note = mongoose.model('Note',NoteSchema);
  module.exports=Note;
  