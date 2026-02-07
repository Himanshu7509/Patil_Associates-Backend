// Import Express Router and table controller
import express from 'express';
import { 
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  getAvailableTablesByCriteria
} from '../controllers/table.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/available')
  .get(getAvailableTablesByCriteria); // Get available tables by criteria

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getAllTables)    // Get all tables
  .post(createTable);   // Create new table

router.route('/:id')
  .get(getTableById)    // Get table by ID
  .put(updateTable)     // Update table
  .delete(deleteTable); // Delete table

export default router;