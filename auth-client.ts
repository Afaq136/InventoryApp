// controllers/authController.js
const axios = require('axios');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');  // Mongoose User model
const BETTERAUTH_API_URL = 'https://api.betterauth.com'; // Your BetterAuth API URL

// Register a new user
async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    // Hash password before saving it
    const passwordHash = await bcrypt.hash(password, 10);

    // Optionally, send request to BetterAuth for user registration (if needed)
    const response = await axios.post(`${BETTERAUTH_API_URL}/register`, { username, email, password });

    // Save user to MongoDB
    const newUser = new User({ username, email, passwordHash });
    await newUser.save();

    return res.status(201).json(response.data); // Return BetterAuth response (user data, token, etc.)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error registering user.' });
  }
}

// Login user
async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    // Check if user exists in MongoDB
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Compare password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password.' });

    // Send login request to BetterAuth (optional)
    const response = await axios.post(`${BETTERAUTH_API_URL}/login`, { email, password });

    return res.status(200).json(response.data);  // Return BetterAuth response (token, user data)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging in user.' });
  }
}

module.exports = { registerUser, loginUser };
