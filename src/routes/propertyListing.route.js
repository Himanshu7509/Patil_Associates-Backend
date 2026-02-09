// Import Express Router and property listing controller
import express from 'express';
import { 
  createPropertyListing,
  getAllPropertyListings, 
  getPropertyListingById, 
  updatePropertyListing, 
  deletePropertyListing,
  getListingsByPropertyId,
  scheduleViewing,
  updateViewingStatus,
  getListingStats,
  uploadListingDocuments,
  deleteListingDocument
} from '../controllers/propertyListing.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route for creating property inquiries (with optional authentication)
router.route('/')
  .post(protect, createPropertyListing); // Authenticated users auto-populate customer info, guests provide info

// Protected routes (require authentication)
router.use(protect);

// All listing routes now require authentication
router.route('/')
  .get(getAllPropertyListings); // Authenticated users see their listings

// Statistics route (admin only)
router.route('/stats')
  .get(authorize('admin'), getListingStats); // Get listing statistics

// Property-specific listings
router.route('/property/:propertyId')
  .get(getListingsByPropertyId); // Get listings for specific property

// Document management routes
router.route('/:listingId/documents')
  .post(protect, uploadListingDocuments); // Upload documents to listing

router.route('/:listingId/documents/:documentIndex')
  .delete(protect, deleteListingDocument); // Delete document from listing

// Viewing schedule routes (agent/admin only)
router.route('/:id/schedule-viewing')
  .put(authorize('admin'), scheduleViewing); // Schedule property viewing

router.route('/:id/viewing-status')
  .put(authorize('admin'), updateViewingStatus); // Update viewing status

// Specific listing routes
router.route('/:id')
  .get(getPropertyListingById)
  .put(authorize('admin'), updatePropertyListing)
  .delete(authorize('admin'), deletePropertyListing);

export default router;