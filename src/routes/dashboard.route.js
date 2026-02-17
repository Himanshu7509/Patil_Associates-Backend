// Import Express Router and dashboard controller
import express from 'express';
import { 
  getDashboardStats,
  getRevenueAnalytics,
  getBookingAnalytics,
  getUserAnalytics,
  getPropertyAnalytics,
  getRealTimeStats
} from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All dashboard routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Main dashboard statistics
router.route('/stats')
  .get(getDashboardStats); // Get comprehensive dashboard statistics

// Analytics routes
router.route('/analytics/revenue')
  .get(getRevenueAnalytics); // Get revenue analytics with filtering

router.route('/analytics/bookings')
  .get(getBookingAnalytics); // Get booking analytics and trends

router.route('/analytics/users')
  .get(getUserAnalytics); // Get user analytics and demographics

router.route('/analytics/properties')
  .get(getPropertyAnalytics); // Get property analytics

// Real-time data
router.route('/realtime')
  .get(getRealTimeStats); // Get real-time dashboard statistics

export default router;