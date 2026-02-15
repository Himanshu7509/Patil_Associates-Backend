// Import Express Router and auth controller
import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePicture, 
  uploadDocument 
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Profile management routes
router.route('/')
  .get(getUserProfile)        // Get user's own profile
  .put(updateUserProfile);    // Update user's own profile

// Profile picture upload route
router.route('/picture')
  .post(upload.single('profilePicture'), uploadProfilePicture); // Upload profile picture

// Document upload route
router.route('/document')
  .post(upload.single('document'), uploadDocument); // Upload document

export default router;