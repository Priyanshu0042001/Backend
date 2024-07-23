const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const noteController = require('../Controllers/NoteController.js');

 // 1 hour in milliseconds

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: "No Token Provided" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: "Token format is incorrect" });
  }

//   if (blackList.has(token)) {
//     const expiryTime = blackList.get(token);
//     if (Date.now() < expiryTime) {
//       return res.status(403).json({ message: "Token is blacklisted" });
//     } else {
//       blackList.delete(token);
//     }
//   }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token", error: err.message });
    }
    req.userId = decoded.id;
    next();
  });
};

router.post('/add', verifyToken, noteController.add);
router.get('/notes', verifyToken, noteController.display);
router.delete('/notes/:id',verifyToken,noteController.deleteNotes);
router.put('/notes/:id',verifyToken,noteController.UpdateNotes);
router.delete('/all',verifyToken,noteController.deleteAll);
router.get('/search',verifyToken,noteController.searchQuery);
module.exports = router;
