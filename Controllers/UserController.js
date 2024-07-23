const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../model/User');
const dotenv = require('dotenv');
dotenv.config();

// const blackList = new Map();
// const TOKEN_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour in milliseconds

// Token verification middleware can be added in the routes or app level if needed
//REGISTERATION OF USER
async function register(req, res) {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid Email Format" });
  }
  
  // Validate password
  if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
    return res.status(400).json({ message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "EMAIL ALREADY EXISTS" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    return res.status(201).json({ message: "User Saved Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "ERROR SAVING USER" });
  }
}
//USER LOGIN FUNCTIONALITY;
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "EMAIL NOT FOUND" });
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "INVALID CREDENTIALS" });
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    console.log("USER LOGIN SUCCESSFUL");
    return res.status(200).json({ message: "Login Successful!", token });
  } catch (error) {
    return res.status(500).json({ message: "ERROR" });
  }
}
//USER LOGOUT FUNCTIONALITY
async function Logout(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: "No Token Provided" });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: "Token format is incorrect" });
  }
 // blackList.set(token, Date.now() + TOKEN_EXPIRY_TIME);
  res.status(200).json({ message: "Logged out successfully" });
}
// function for BlackListing 
// function cleanUpBlacklist() {
//   const now = Date.now();
//   for (const [token, expiryTime] of blackList.entries()) {
//     if (now >= expiryTime) {
//       blackList.delete(token);
//     }
//   }
// }

// // Clean up blacklisted tokens every 5 minutes
// setInterval(cleanUpBlacklist, 5 * 60 * 1000);

module.exports = { register, login, Logout };
