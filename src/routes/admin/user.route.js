// Import Express Router and auth controller
import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../../controllers/auth.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);
router.use(authorize('admin')); // Only admin can access these routes

// User management routes
router.route('/')
  .get(getAllUsers); // Get all users (admin only)

router.route('/:id')
  .get(getUserById)    // Get user by ID (admin only)
  .put(updateUser)     // Update user (admin only)
  .delete(deleteUser); // Delete user (admin only)

export default router;