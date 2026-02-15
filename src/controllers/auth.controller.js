// Import required packages
import User from '../models/auth.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { uploadToS3, deleteFromS3 } from '../utils/upload.js';

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

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNo, roles } = req.body;
    
    // Check if user exists
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phoneNo) updateData.phoneNo = phoneNo;
    if (roles) updateData.roles = roles;
    
    // Handle profile picture update separately to avoid conflicts
    if (req.body.profilePicture !== undefined) {
      updateData.profilePicture = req.body.profilePicture;
    }
    
    // Handle documents update separately
    if (req.body.documents !== undefined) {
      updateData.documents = req.body.documents;
    }
    
    // Handle address update separately
    if (req.body.address !== undefined) {
      updateData.address = req.body.address;
    }
    
    // Handle additional profile fields
    if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.isEmailVerified !== undefined) updateData.isEmailVerified = req.body.isEmailVerified;
    if (req.body.isPhoneVerified !== undefined) updateData.isPhoneVerified = req.body.isPhoneVerified;
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, JPG, and PNG are allowed.'
      });
    }

    // Limit file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit.'
      });
    }

    // Upload to S3
    const imageUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype, 'profile-pictures');
    
    // Update user with profile picture URL
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      await deleteFromS3(user.profilePicture);
    }

    user.profilePicture = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profilePicture: imageUrl }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    
    // Validate file type (allow images and PDFs)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images, PDFs, and Word documents are allowed.'
      });
    }

    // Limit file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit.'
      });
    }

    // Upload to S3
    const documentUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype, 'user-documents');
    
    // Update user with document info
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add document to user's documents array
    const documentInfo = {
      name: file.originalname,
      url: documentUrl,
      type: file.mimetype
    };
    
    user.documents.push(documentInfo);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document: documentInfo }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, phoneNo, address, dateOfBirth, gender } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNo) updateData.phoneNo = phoneNo;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
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
