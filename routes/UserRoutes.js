const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserController.js');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken'); // Import jwt
require('dotenv').config(); // Ensure dotenv is configured if using environment variables

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Blacklist and token expiry time setup
// const blackList = new Map();
// const TOKEN_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour in milliseconds

// Token verification middleware
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

// Routes
router.post('/reg', limiter, userController.register);
router.post('/login', limiter, userController.login);
router.post('/logout', verifyToken, userController.Logout);

module.exports = router;