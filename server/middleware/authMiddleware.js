const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token's ID
      req.user = await User.findById(decoded.id).select('-password');

      // 4. THE CRITICAL FIX: Check if the user still exists
      if (req.user) {
        next(); // User found, proceed to the next step (the controller)
      } else {
        // User not found with this ID (e.g., deleted), so not authorized
        res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } catch (error) {
      // This catches errors like an expired or invalid token
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };