// Import required packages
import HotelRoom from '../models/hotelRoom.model.js';
import HotelBooking from '../models/hotelBooking.model.js';
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

// Create a new hotel room
export const createRoom = [
  upload.array('images', 10), // Allow up to 10 images
  async (req, res) => {
    try {
      const roomData = req.body;
      
      // Check if room with same number already exists
      const existingRoom = await HotelRoom.findOne({ 
        roomNumber: roomData.roomNumber 
      });
      
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Room with this number already exists'
        });
      }

      let imageUrls = [];
      
      // Handle image uploads if files are provided
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const imageUrl = await uploadToS3(file, 'hotel-rooms');
          imageUrls.push(imageUrl);
        }
      }

      // Create room with image URLs if available
      const newRoom = await HotelRoom.create({
        ...roomData,
        images: imageUrls
      });

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: newRoom
      });

    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating room',
        error: error.message
      });
    }
  }
];

// Get all hotel rooms with pagination
export const getAllRooms = async (req, res) => {
  try {
    const { isActive, isAvailable, roomType, viewType, floor, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    
    if (roomType) {
      query.roomType = roomType;
    }
    
    if (viewType) {
      query.viewType = viewType;
    }
    
    if (floor) {
      query.floor = parseInt(floor);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalItems = await HotelRoom.countDocuments(query);
    
    // Get paginated results
    const rooms = await HotelRoom.find(query)
      .sort({ floor: 1, roomNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1
      },
      count: rooms.length
    });

  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving rooms',
      error: error.message
    });
  }
};

// Get a single hotel room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await HotelRoom.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: room
    });

  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving room',
      error: error.message
    });
  }
};

// Update a hotel room by ID
export const updateRoom = [
  upload.array('images', 10), // Allow up to 10 images
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if room exists
      const room = await HotelRoom.findById(id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // If updating room number, check if another room with same number exists
      if (updateData.roomNumber && updateData.roomNumber !== room.roomNumber) {
        const existingRoom = await HotelRoom.findOne({ 
          roomNumber: updateData.roomNumber,
          _id: { $ne: id }
        });
        if (existingRoom) {
          return res.status(400).json({
            success: false,
            message: 'Room with this number already exists'
          });
        }
      }

      // Handle image updates if files are provided
      if (req.files && req.files.length > 0) {
        // Upload new images to S3
        let newImageUrls = [];
        for (const file of req.files) {
          const imageUrl = await uploadToS3(file, 'hotel-rooms');
          newImageUrls.push(imageUrl);
        }
        
        // Delete old images from S3 if they exist
        if (room.images && room.images.length > 0) {
          for (const imageUrl of room.images) {
            await deleteImageFromS3(imageUrl);
          }
        }
        
        // Add new image URLs to update data
        updateData.images = newImageUrls;
      }

      const updatedRoom = await HotelRoom.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: updatedRoom
      });

    } catch (error) {
      console.error('Update room error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating room',
        error: error.message
      });
    }
  }
];

// Delete a hotel room by ID
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await HotelRoom.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room has any active bookings
    const activeBookings = await HotelBooking.findOne({
      roomId: id,
      status: { $in: ['pending', 'confirmed', 'checked_in'] }
    });

    if (activeBookings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
    }

    // Delete images from S3 if they exist
    if (room.images && room.images.length > 0) {
      for (const imageUrl of room.images) {
        await deleteImageFromS3(imageUrl);
      }
    }

    await HotelRoom.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

// Get available rooms for specific dates
export const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, numberOfGuests, roomType } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Find rooms that are booked during the requested period
    const bookedRooms = await HotelBooking.find({
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        }
      ],
      status: { $in: ['pending', 'confirmed', 'checked_in'] }
    }).select('roomId');

    const bookedRoomIds = bookedRooms.map(booking => booking.roomId);

    // Build query for available rooms
    let query = {
      _id: { $nin: bookedRoomIds },
      isActive: true,
      isAvailable: true
    };

    if (numberOfGuests) {
      query.capacity = { $gte: parseInt(numberOfGuests) };
    }

    if (roomType) {
      query.roomType = roomType;
    }

    const availableRooms = await HotelRoom.find(query).sort({ pricePerNight: 1 });

    res.status(200).json({
      success: true,
      message: 'Available rooms retrieved successfully',
      data: {
        checkInDate,
        checkOutDate,
        numberOfGuests: numberOfGuests || null,
        roomType: roomType || null,
        availableRooms,
        count: availableRooms.length
      }
    });

  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving available rooms',
      error: error.message
    });
  }
};

// Upload room images
export const uploadRoomImages = [
  upload.array('images', 10),
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
        const imageUrl = await uploadToS3(file, 'hotel-rooms');
        imageUrls.push(imageUrl);
      }

      res.status(200).json({
        success: true,
        message: 'Room images uploaded successfully',
        data: {
          imageUrls
        }
      });
    } catch (error) {
      console.error('Upload room images error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading room images',
        error: error.message
      });
    }
  }
];

// Get room by ID (Public)
export const getRoomByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await HotelRoom.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: room
    });

  } catch (error) {
    console.error('Get room by ID public error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving room',
      error: error.message
    });
  }
};

// Get room statistics
export const getRoomStats = async (req, res) => {
  try {
    const totalRooms = await HotelRoom.countDocuments();
    const activeRooms = await HotelRoom.countDocuments({ isActive: true });
    const availableRooms = await HotelRoom.countDocuments({ 
      isActive: true, 
      isAvailable: true 
    });
    const occupiedRooms = await HotelRoom.countDocuments({ 
      isActive: true, 
      isAvailable: false 
    });

    // Get room type distribution
    const roomTypeStats = await HotelRoom.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$roomType',
          count: { $sum: 1 },
          averagePrice: { $avg: '$pricePerNight' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Room statistics retrieved successfully',
      data: {
        totalRooms,
        activeRooms,
        availableRooms,
        occupiedRooms,
        roomTypeStats
      }
    });

  } catch (error) {
    console.error('Get room stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving room statistics',
      error: error.message
    });
  }
};