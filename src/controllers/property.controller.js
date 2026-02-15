// Import required packages
import Property from '../models/property.model.js';
import PropertyListing from '../models/propertyListing.model.js';
import s3 from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload image to AWS S3
const uploadToS3 = async (file, folder) => {
  const fileKey = `patil-associate/${folder}/${uuidv4()}-${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploaded = await s3.upload(params).promise();
  return uploaded.Location; // Return public URL
};

// Helper function to delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract key from URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(3).join('/'); // Remove https://bucket-name.s3.region.amazonaws.com/
    
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();
  } catch (error) {
    console.error('Error deleting image from S3:', error);
  }
};

// Create a new property
export const createProperty = [
  upload.array('images', 20), // Allow up to 20 images
  async (req, res) => {
    try {
      const propertyData = req.body;
      
      // If user is authenticated, associate the property with the user as agent
      if (req.user) {
        propertyData.agentId = req.user._id;
      }

      let imageUrls = [];
      
      // Handle image uploads if files are provided
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = await uploadToS3(file, 'properties');
          imageUrls.push(imageUrl);
        }
      }

      // Create property with image URLs if available
      const newProperty = await Property.create({
        ...propertyData,
        images: imageUrls
      });

      // Populate agent details if exists
      const populatedProperty = await Property.findById(newProperty._id)
        .populate('agentId', 'fullName email phoneNo');

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: populatedProperty
      });

    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating property',
        error: error.message
      });
    }
  }
];

// Get all properties with pagination
export const getAllProperties = async (req, res) => {
  try {
    const { 
      propertyType, 
      listingType, 
      isActive, 
      isFeatured, 
      city, 
      minPrice, 
      maxPrice,
      bedrooms,
      search,
      page = 1,
      limit = 12
    } = req.query;
    
    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }
    
    if (propertyType) {
      query.propertyType = propertyType;
    }
    
    if (listingType) {
      query.listingType = listingType;
    }
    
    if (city) {
      query['address.city'] = { $regex: new RegExp(city, 'i') };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (bedrooms) {
      query.bedrooms = { $gte: parseInt(bedrooms) };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalItems = await Property.countDocuments(query);
    
    // Get paginated results
    const properties = await Property.find(query)
      .populate('agentId', 'fullName email phoneNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: properties,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1
      },
      count: properties.length
    });

  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving properties',
      error: error.message
    });
  }
};

// Get a single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate('agentId', 'fullName email phoneNo');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property
    });

  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property',
      error: error.message
    });
  }
};

// Update a property by ID
export const updateProperty = [
  upload.array('images', 20), // Allow up to 20 images
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if property exists
      const property = await Property.findById(id);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Handle image updates if files are provided
      if (req.files && req.files.length > 0) {
        // Upload new images to S3
        let newImageUrls = [];
        for (const file of req.files) {
          const imageUrl = await uploadToS3(file, 'properties');
          newImageUrls.push(imageUrl);
        }
        
        // Delete old images from S3 if they exist
        if (property.images && property.images.length > 0) {
          for (const imageUrl of property.images) {
            await deleteImageFromS3(imageUrl);
          }
        }
        
        // Add new image URLs to update data
        updateData.images = newImageUrls;
      }

      const updatedProperty = await Property.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('agentId', 'fullName email phoneNo');

      res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: updatedProperty
      });

    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating property',
        error: error.message
      });
    }
  }
];

// Delete a property by ID
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property has any active listings
    const activeListings = await PropertyListing.findOne({
      propertyId: id,
      status: { $in: ['pending', 'reviewed', 'accepted'] }
    });

    if (activeListings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete property with active listings'
      });
    }

    // Delete images from S3 if they exist
    if (property.images && property.images.length > 0) {
      for (const imageUrl of property.images) {
        await deleteImageFromS3(imageUrl);
      }
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};

// Upload property images
export const uploadPropertyImages = [
  upload.array('images', 20),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files uploaded'
        });
      }

      // Upload images to S3
      let imageUrls = [];
      for (const file of req.files) {
        const imageUrl = await uploadToS3(file, 'properties');
        imageUrls.push(imageUrl);
      }

      res.status(200).json({
        success: true,
        message: 'Property images uploaded successfully',
        data: {
          imageUrls
        }
      });
    } catch (error) {
      console.error('Upload property images error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading property images',
        error: error.message
      });
    }
  }
];

// Get featured properties
export const getFeaturedProperties = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const properties = await Property.find({ 
      isFeatured: true, 
      isActive: true 
    })
    .populate('agentId', 'fullName email phoneNo')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Featured properties retrieved successfully',
      data: properties,
      count: properties.length
    });

  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving featured properties',
      error: error.message
    });
  }
};

// Get property statistics
export const getPropertyStats = async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view statistics.'
      });
    }

    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ isActive: true });
    const featuredProperties = await Property.countDocuments({ isFeatured: true });
    const saleProperties = await Property.countDocuments({ listingType: 'sale' });
    const rentProperties = await Property.countDocuments({ listingType: 'rent' });
    const leaseProperties = await Property.countDocuments({ listingType: 'lease' });

    // Get property type distribution
    const propertyTypeStats = await Property.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Property statistics retrieved successfully',
      data: {
        totalProperties,
        activeProperties,
        featuredProperties,
        saleProperties,
        rentProperties,
        leaseProperties,
        propertyTypeStats
      }
    });

  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property statistics',
      error: error.message
    });
  }
};