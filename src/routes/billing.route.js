// Import required packages
import express from 'express';
import { 
  createOrderFromBooking,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderStats,
  generateBill
} from '../controllers/billing.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes (require authentication and admin role)
router.use(protect);
router.use(authorize('admin'));

// Order management routes
router.post('/create-from-booking', createOrderFromBooking);
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.get('/:id/bill', generateBill);

export default router;