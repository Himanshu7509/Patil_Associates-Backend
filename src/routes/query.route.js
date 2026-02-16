// Import Express Router and query controller
import express from 'express';
import { 
  createQuery,
  getAllQueries,
  getQueryById,
  updateQueryStatus,
  deleteQuery,
  getQueryStats
} from '../controllers/query.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - Submit a query
router.route('/')
  .post(createQuery); // Create new query (public access)

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getAllQueries); // Get all queries (admin only)

router.route('/stats')
  .get(getQueryStats); // Get query statistics (admin only)

router.route('/:id')
  .get(getQueryById)        // Get query by ID (admin only)
  .put(updateQueryStatus)   // Update query status (admin only)
  .delete(deleteQuery);     // Delete query (admin only)

export default router;