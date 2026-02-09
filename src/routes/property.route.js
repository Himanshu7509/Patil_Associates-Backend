// Import Express Router and property controller
import express from 'express';
import { 
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  getFeaturedProperties,
  getPropertyStats
} from '../controllers/property.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/featured')
  .get(getFeaturedProperties); // Get featured properties

router.route('/stats')
  .get(protect, authorize('admin'), getPropertyStats); // Get property statistics (admin only)

router.route('/')
  .get(getAllProperties); // Get all properties (public access)

// Image upload route (admin only)
router.route('/upload/images')
  .post(protect, authorize('admin'), uploadPropertyImages); // Upload property images

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .post(createProperty); // Create new property

router.route('/:id')
  .get(getPropertyById)    // Get property by ID
  .put(updateProperty)     // Update property
  .delete(deleteProperty); // Delete property

export default router;