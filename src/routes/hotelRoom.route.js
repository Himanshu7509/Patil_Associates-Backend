// Import Express Router and hotel room controller
import express from 'express';
import {  
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomByIdPublic,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomStats,
  uploadRoomImages
} from '../controllers/hotelRoom.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/available')
  .get(getAvailableRooms); // Get available rooms for specific dates

router.route('/stats')
  .get(protect, authorize('admin'), getRoomStats); // Get room statistics (admin only)

router.route('/public/:id')
  .get(getRoomByIdPublic); // Get room by ID (public access)

// Image upload route (admin only)
router.route('/upload/images')
  .post(protect, authorize('admin'), uploadRoomImages); // Upload room images

router.route('/')
  .get(getAllRooms); // Get all rooms (public access to active rooms)

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .post(createRoom); // Create new room

router.route('/:id')
  .get(getRoomById)    // Get room by ID
  .put(updateRoom)     // Update room
  .delete(deleteRoom); // Delete room

export default router;