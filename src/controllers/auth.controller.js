// Import required packages
import User from '../models/auth.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (userId, roles) => {
  return jwt.sign(
    { userId, roles },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, phoneNo } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Determine user roles
    let userRoles = ['customer']; // Default role
    
    // Check if this is the admin user trying to register
    if (email === process.env.ADMIN_EMAIL) {
      // For admin email, verify the password matches admin password
      const isValidAdmin = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
      if (isValidAdmin) {
        userRoles = ['admin'];
      }
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNo,
      roles: userRoles
    });

    // Generate token
    const token = generateToken(user._id, user.roles);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if this is admin login attempt
    const isAdminCredentials = (email === process.env.ADMIN_EMAIL);
    
    if (isAdminCredentials) {
      // Check if the entered password matches the admin password from env (plaintext comparison)
      const isCorrectAdminPassword = (password === process.env.ADMIN_PASSWORD);
      
      if (isCorrectAdminPassword) {
        // Check if admin user exists in database
        let user = await User.findOne({ email });
        
        if (!user) {
          // Create admin user if it doesn't exist
          user = await User.create({
            fullName: 'Admin User',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            phoneNo: '0000000000',
            roles: ['admin']
          });
        } else {
          // Ensure existing user has admin role
          if (!user.roles.includes('admin')) {
            user.roles = ['admin'];
            await user.save();
          }
        }
        
        // Admin login successful
        const token = generateToken(user._id, user.roles);
        user.password = undefined;
        
        return res.status(200).json({
          success: true,
          message: 'Admin login successful',
          token,
          user
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }
    }
    
    // Regular user login
    // Check if user exists with provided email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Regular user login
    const token = generateToken(user._id, user.roles);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};
