const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const UserRoutes = require('./routes/UserRoutes');
const NotesRoutes=require('./routes/NoteRoutes');
const app = express();
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/', UserRoutes);
app.use('/',NotesRoutes);

// Database connection
async function connect() {
  try {
    await mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("CONNECTED TO DATABASE");
  } catch (error) {
    console.log("ERROR CONNECTING TO DATABASE", error);
  }
}
// Calling connect Function
connect();
// SERVER LISTENING
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
