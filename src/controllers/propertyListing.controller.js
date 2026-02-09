// Import required packages
import PropertyListing from '../models/propertyListing.model.js';
import Property from '../models/property.model.js';
import s3 from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure multer with memory storage for documents
const documentStorage = multer.memoryStorage();
const uploadDocument = multer({ 
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, Excel, and image files are allowed!'), false);
    }
  }
});

// Upload document to AWS S3
const uploadDocumentToS3 = async (file) => {
  const fileKey = `patil-associate/property-documents/${uuidv4()}-${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploaded = await s3.upload(params).promise();
  return uploaded.Location; // Return public URL
};

// Helper function to delete document from S3
const deleteDocumentFromS3 = async (documentUrl) => {
  if (!documentUrl) return;
  
  try {
    // Extract key from URL
    const urlParts = documentUrl.split('/');
    const key = urlParts.slice(3).join('/'); // Remove https://bucket-name.s3.region.amazonaws.com/
    
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();
  } catch (error) {
    console.error('Error deleting document from S3:', error);
  }
};

// Create a new property listing (inquiry/offer)
export const createPropertyListing = async (req, res) => {
  try {
    const listingData = req.body;

    // Debug: Log user info
    console.log('User from token:', req.user);
    console.log('Request headers:', req.headers.authorization);

    // If user is authenticated, associate the listing with the user and populate customer info
    if (req.user) {
      listingData.customerId = req.user._id;
      console.log('Associated listing with user:', req.user._id);
      
      // Automatically populate customer info from user data
      listingData.customerInfo = {
        name: req.user.fullName || '',
        email: req.user.email || '',
        phone: req.user.phoneNo || '',
        message: listingData.customerInfo?.message || '' // Keep any custom message
      };
      
      console.log('Auto-populated customer info from user:', listingData.customerInfo);
    } else {
      // If no authenticated user, customer info must be provided in request body
      if (!listingData.customerInfo || !listingData.customerInfo.name || 
          !listingData.customerInfo.email || !listingData.customerInfo.phone) {
        return res.status(400).json({
          success: false,
          message: 'Customer information (name, email, phone) is required when not logged in'
        });
      }
    }

    // Validate property exists if propertyId is provided
    if (listingData.propertyId) {
      const property = await Property.findById(listingData.propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }
      
      // Set agentId from property if not provided
      if (!listingData.agentId && property.agentId) {
        listingData.agentId = property.agentId;
      }
    }

    // Create new listing
    const newListing = await PropertyListing.create(listingData);

    // Populate related data
    const populatedListing = await PropertyListing.findById(newListing._id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo')
      .populate('propertyId', 'title propertyType listingType price');

    res.status(201).json({
      success: true,
      message: 'Property listing created successfully',
      data: populatedListing
    });

  } catch (error) {
    console.error('Create property listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property listing',
      error: error.message
    });
  }
};

// Get all property listings
export const getAllPropertyListings = async (req, res) => {
  try {
    console.log('getAllPropertyListings called');
    console.log('User in request:', req.user);
    console.log('User roles:', req.user?.roles);
    
    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    console.log('Is admin:', isAdmin);
    
    let query = {};
    
    if (!isAdmin) {
      // If not admin, only show listings for the current user
      if (req.user) {
        query.$or = [
          { customerId: req.user._id },
          { agentId: req.user._id }
        ];
        console.log('Querying for user ID:', req.user._id);
      } else {
        // If not logged in, return empty array
        return res.status(200).json({
          success: true,
          message: 'Property listings retrieved successfully',
          data: [],
          count: 0
        });
      }
    }

    const { listingType, status, propertyId } = req.query;
    
    if (listingType) {
      query.listingType = listingType;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (propertyId) {
      query.propertyId = propertyId;
    }

    const listings = await PropertyListing.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo')
      .populate('propertyId', 'title propertyType listingType price address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Property listings retrieved successfully',
      data: listings,
      count: listings.length
    });

  } catch (error) {
    console.error('Get all property listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property listings',
      error: error.message
    });
  }
};

// Get a single property listing by ID
export const getPropertyListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await PropertyListing.findById(id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo')
      .populate('propertyId', 'title propertyType listingType price address images');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found'
      });
    }

    // Check if user is admin or if the listing belongs to the current user
    const isAdmin = req.user?.roles?.includes('admin');
    const isOwner = listing.customerId?._id.toString() === req.user?._id.toString();
    const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
    
    if (!isAdmin && !isOwner && !isAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property listing retrieved successfully',
      data: listing
    });

  } catch (error) {
    console.error('Get property listing by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property listing',
      error: error.message
    });
  }
};

// Update a property listing by ID
export const updatePropertyListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const listing = await PropertyListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found'
      });
    }

    // Check if user is admin or the agent
    const isAdmin = req.user?.roles?.includes('admin');
    const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
    
    if (!isAdmin && !isAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and assigned agents can update listings.'
      });
    }

    const updatedListing = await PropertyListing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('customerId', 'fullName email phoneNo')
    .populate('agentId', 'fullName email phoneNo')
    .populate('propertyId', 'title propertyType listingType price');

    res.status(200).json({
      success: true,
      message: 'Property listing updated successfully',
      data: updatedListing
    });

  } catch (error) {
    console.error('Update property listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property listing',
      error: error.message
    });
  }
};

// Delete a property listing by ID
export const deletePropertyListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await PropertyListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found'
      });
    }

    // Check if user is admin or the agent
    const isAdmin = req.user?.roles?.includes('admin');
    const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
    
    if (!isAdmin && !isAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and assigned agents can delete listings.'
      });
    }

    await PropertyListing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully'
    });

  } catch (error) {
    console.error('Delete property listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property listing',
      error: error.message
    });
  }
};

// Get listings by property ID
export const getListingsByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { listingType, status } = req.query;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    let query = { propertyId: propertyId };
    
    if (listingType) {
      query.listingType = listingType;
    }
    
    if (status) {
      query.status = status;
    }

    const listings = await PropertyListing.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Property listings retrieved successfully',
      data: listings,
      count: listings.length
    });

  } catch (error) {
    console.error('Get listings by property ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property listings',
      error: error.message
    });
  }
};

// Schedule property viewing
export const scheduleViewing = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    const listing = await PropertyListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found'
      });
    }

    // Check if user is admin or the agent
    const isAdmin = req.user?.roles?.includes('admin');
    const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
    
    if (!isAdmin && !isAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and assigned agents can schedule viewings.'
      });
    }

    // Update viewing schedule
    listing.viewingSchedule = {
      date: new Date(date),
      time: time,
      status: 'scheduled'
    };

    await listing.save();

    const updatedListing = await PropertyListing.findById(id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo')
      .populate('propertyId', 'title address');

    res.status(200).json({
      success: true,
      message: 'Property viewing scheduled successfully',
      data: updatedListing
    });

  } catch (error) {
    console.error('Schedule viewing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling property viewing',
      error: error.message
    });
  }
};

// Update viewing status
export const updateViewingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const listing = await PropertyListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found'
      });
    }

    // Check if user is admin or the agent
    const isAdmin = req.user?.roles?.includes('admin');
    const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
    
    if (!isAdmin && !isAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and assigned agents can update viewing status.'
      });
    }

    if (listing.viewingSchedule) {
      listing.viewingSchedule.status = status;
      await listing.save();
    }

    const updatedListing = await PropertyListing.findById(id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo');

    res.status(200).json({
      success: true,
      message: 'Viewing status updated successfully',
      data: updatedListing
    });

  } catch (error) {
    console.error('Update viewing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating viewing status',
      error: error.message
    });
  }
};

// Upload documents for property listing
export const uploadListingDocuments = [
  uploadDocument.array('documents', 5), // Allow up to 5 documents
  async (req, res) => {
    try {
      const { listingId } = req.params;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No document files uploaded'
        });
      }

      // Check if listing exists
      const listing = await PropertyListing.findById(listingId);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Property listing not found'
        });
      }

      // Check if user is admin or the agent/customer
      const isAdmin = req.user?.roles?.includes('admin');
      const isOwner = listing.customerId?._id.toString() === req.user?._id.toString();
      const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
      
      if (!isAdmin && !isOwner && !isAgent) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload documents to your own listings.'
        });
      }

      // Upload documents to S3 and create document records
      let documentRecords = [];
      for (const file of req.files) {
        const documentUrl = await uploadDocumentToS3(file);
        documentRecords.push({
          name: file.originalname,
          url: documentUrl,
          type: file.mimetype
        });
      }

      // Add new documents to existing documents array
      if (!listing.documents) {
        listing.documents = [];
      }
      listing.documents.push(...documentRecords);
      
      await listing.save();

      const updatedListing = await PropertyListing.findById(listingId)
        .populate('customerId', 'fullName email phoneNo')
        .populate('agentId', 'fullName email phoneNo')
        .populate('propertyId', 'title propertyType listingType price');

      res.status(200).json({
        success: true,
        message: 'Documents uploaded successfully',
        data: updatedListing
      });

    } catch (error) {
      console.error('Upload listing documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading documents',
        error: error.message
      });
    }
  }
];

// Delete document from property listing
export const deleteListingDocument = async (req, res) => {
  try {
    const { listingId, documentIndex } = req.params;
    
    // Check if listing exists
    const listing = await PropertyListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found'
      });
    }

    // Check if user is admin or the agent/customer
    const isAdmin = req.user?.roles?.includes('admin');
    const isOwner = listing.customerId?._id.toString() === req.user?._id.toString();
    const isAgent = listing.agentId?._id.toString() === req.user?._id.toString();
    
    if (!isAdmin && !isOwner && !isAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete documents from your own listings.'
      });
    }

    // Check if document exists at the specified index
    if (!listing.documents || !listing.documents[documentIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete document from S3
    const documentUrl = listing.documents[documentIndex].url;
    await deleteDocumentFromS3(documentUrl);

    // Remove document from array
    listing.documents.splice(documentIndex, 1);
    await listing.save();

    const updatedListing = await PropertyListing.findById(listingId)
      .populate('customerId', 'fullName email phoneNo')
      .populate('agentId', 'fullName email phoneNo')
      .populate('propertyId', 'title propertyType listingType price');

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: updatedListing
    });

  } catch (error) {
    console.error('Delete listing document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// Get listing statistics
export const getListingStats = async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view statistics.'
      });
    }

    const totalListings = await PropertyListing.countDocuments();
    const pendingListings = await PropertyListing.countDocuments({ status: 'pending' });
    const acceptedListings = await PropertyListing.countDocuments({ status: 'accepted' });
    const completedListings = await PropertyListing.countDocuments({ status: 'completed' });
    const cancelledListings = await PropertyListing.countDocuments({ status: 'cancelled' });

    // Get listings by type
    const typeStats = await PropertyListing.aggregate([
      {
        $group: {
          _id: '$listingType',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent listings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentListings = await PropertyListing.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).countDocuments();

    res.status(200).json({
      success: true,
      message: 'Listing statistics retrieved successfully',
      data: {
        totalListings,
        pendingListings,
        acceptedListings,
        completedListings,
        cancelledListings,
        typeStats,
        recentListings
      }
    });

  } catch (error) {
    console.error('Get listing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving listing statistics',
      error: error.message
    });
  }
};