import jwt from 'jsonwebtoken';
import User from '../models/auth.model.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  console.log('Protect middleware called');
  console.log('Authorization header:', req.headers.authorization);

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded, payload:', decoded);

      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');
      
      console.log('Token decoded successfully, user ID:', decoded.userId);
      console.log('User found:', req.user ? req.user.fullName : 'No user found');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Middleware to restrict to certain roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in'
      });
    }

    // Check if user has any of the required roles
    const hasRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User roles '${req.user.roles.join(', ')}' are not authorized to access this route. Roles ${roles.join(', ')} are allowed.`
      });
    }

    next();
  };
};
