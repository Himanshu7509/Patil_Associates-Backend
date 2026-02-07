// Import Express Router and menu controller
import express from 'express';
import { 
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
  getDietaryMenuItems,
  searchMenuItems
} from '../controllers/menu.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/search')
  .get(searchMenuItems); // Search menu items

router.route('/category/:category')
  .get(getMenuItemsByCategory); // Get menu items by category

router.route('/dietary/:dietaryType')
  .get(getDietaryMenuItems); // Get dietary-specific menu items

router.route('/')
  .get(getAllMenuItems); // Get all menu items (public access to active items)

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .post(createMenuItem); // Create new menu item

router.route('/:id')
  .get(getMenuItemById)    // Get menu item by ID
  .put(updateMenuItem)     // Update menu item
  .delete(deleteMenuItem); // Delete menu item

export default router;