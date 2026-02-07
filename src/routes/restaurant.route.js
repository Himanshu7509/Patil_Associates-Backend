// Import Express Router and restaurant controller
import express from 'express';
import { 
  createBooking,
  getAllBookings, 
  getBookingById, 
  updateBooking, 
  deleteBooking,
  getBookingsByDateRange,
  getAvailableTables
} from '../controllers/restaurant.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/date-range')
  .get(getBookingsByDateRange); // Get bookings by date range

router.route('/available-tables')
  .get(getAvailableTables); // Check available tables

// Protected routes (require authentication)
router.use(protect);

// All booking routes now require authentication
router.route('/')
  .get(getAllBookings)  // Authenticated users see their bookings
  .post(createBooking); // Only authenticated users can create bookings

// Specific booking routes
router.route('/:id')
  .get(getBookingById)
  .put(authorize('admin'), updateBooking)
  .delete(authorize('admin'), deleteBooking);

export default router;