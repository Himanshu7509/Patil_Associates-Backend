// Import Express Router and hotel booking controller
import express from 'express';
import { 
  createBooking,
  getAllBookings, 
  getBookingById, 
  updateBooking, 
  deleteBooking,
  getBookingsByDateRange,
  checkRoomAvailability,
  getBookingStats
} from '../controllers/hotelBooking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/check-availability')
  .get(checkRoomAvailability); // Check room availability

router.route('/date-range')
  .get(getBookingsByDateRange); // Get bookings by date range

// Protected routes (require authentication)
router.use(protect);

// All booking routes now require authentication
router.route('/')
  .get(getAllBookings)  // Authenticated users see their bookings
  .post(createBooking); // Only authenticated users can create bookings

// Statistics route (admin only)
router.route('/stats')
  .get(authorize('admin'), getBookingStats); // Get booking statistics

// Specific booking routes
router.route('/:id')
  .get(getBookingById)
  .put(authorize('admin'), updateBooking)
  .delete(authorize('admin'), deleteBooking);

export default router;