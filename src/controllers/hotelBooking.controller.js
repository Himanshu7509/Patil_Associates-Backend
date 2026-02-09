// Import required packages
import HotelBooking from '../models/hotelBooking.model.js';
import HotelRoom from '../models/hotelRoom.model.js';

// Create a new hotel booking
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // Debug: Log user info
    console.log('User from token:', req.user);
    console.log('Request headers:', req.headers.authorization);

    // If user is authenticated, associate the booking with the user and populate guest info
    if (req.user) {
      bookingData.customerId = req.user._id;
      console.log('Associated booking with user:', req.user._id);
      
      // Automatically populate guest info from user data if not provided
      if (!bookingData.guestName) {
        bookingData.guestName = req.user.fullName || '';
      }
      if (!bookingData.guestEmail) {
        bookingData.guestEmail = req.user.email || '';
      }
      if (!bookingData.guestPhone) {
        bookingData.guestPhone = req.user.phoneNo || '';
      }
      
      console.log('Auto-populated guest info from user:', {
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone
      });
    } else {
      // If no authenticated user, guest info must be provided in request body
      if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
        return res.status(400).json({
          success: false,
          message: 'Guest information (name, email, phone) is required when not logged in'
        });
      }
      console.log('No user found in request - using provided guest information');
    }

    // Validate room exists and is available
    const room = await HotelRoom.findById(bookingData.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isActive || !room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check for overlapping bookings
    const existingBooking = await HotelBooking.findOne({
      roomId: bookingData.roomId,
      $or: [
        {
          checkInDate: { $lt: new Date(bookingData.checkOutDate) },
          checkOutDate: { $gt: new Date(bookingData.checkInDate) }
        }
      ],
      status: { $in: ['pending', 'confirmed', 'checked_in'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected dates'
      });
    }

    // Calculate total price if not provided
    if (!bookingData.totalPrice) {
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      bookingData.totalPrice = room.pricePerNight * nights;
    }

    // Create new booking
    const newBooking = await HotelBooking.create(bookingData);

    // Populate related data
    const populatedBooking = await HotelBooking.findById(newBooking._id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('roomId', 'roomNumber roomType floor');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get all hotel bookings
export const getAllBookings = async (req, res) => {
  try {
    console.log('getAllBookings called');
    console.log('User in request:', req.user);
    console.log('User roles:', req.user?.roles);
    
    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    console.log('Is admin:', isAdmin);
    
    let query = {};
    
    if (!isAdmin) {
      // If not admin, only show bookings for the current user
      if (req.user) {
        query.customerId = req.user._id;
        console.log('Querying for user ID:', req.user._id);
      } else {
        // If not logged in, return empty array or only confirmed bookings
        query.status = 'confirmed';
        console.log('No user, querying only confirmed bookings');
      }
    }

    const bookings = await HotelBooking.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .populate('roomId', 'roomNumber roomType floor pricePerNight')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bookings',
      error: error.message
    });
  }
};

// Get a single hotel booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await HotelBooking.findById(id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('roomId', 'roomNumber roomType floor pricePerNight');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is admin or if the booking belongs to the current user
    const isAdmin = req.user?.roles?.includes('admin');
    
    if (!isAdmin && booking.customerId?._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving booking',
      error: error.message
    });
  }
};

// Update a hotel booking by ID
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await HotelBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can update bookings.'
      });
    }

    // If updating dates, check for conflicts
    if (updateData.checkInDate || updateData.checkOutDate) {
      const newCheckIn = updateData.checkInDate ? new Date(updateData.checkInDate) : booking.checkInDate;
      const newCheckOut = updateData.checkOutDate ? new Date(updateData.checkOutDate) : booking.checkOutDate;
      
      const existingBooking = await HotelBooking.findOne({
        roomId: booking.roomId,
        _id: { $ne: id },
        $or: [
          {
            checkInDate: { $lt: newCheckOut },
            checkOutDate: { $gt: newCheckIn }
          }
        ],
        status: { $in: ['pending', 'confirmed', 'checked_in'] }
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: 'Room is already booked for the selected dates'
        });
      }
    }

    const updatedBooking = await HotelBooking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('customerId', 'fullName email phoneNo')
    .populate('roomId', 'roomNumber roomType floor pricePerNight');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

// Delete a hotel booking by ID
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await HotelBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can delete bookings.'
      });
    }

    await HotelBooking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
};

// Get bookings by date range
export const getBookingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    
    let query = {
      checkInDate: { $gte: start, $lte: end }
    };
    
    if (status) {
      query.status = status;
    }
    
    if (!isAdmin) {
      // If not admin, only show bookings for the current user
      if (req.user) {
        query.customerId = req.user._id;
      } else {
        // If not logged in, only show confirmed bookings
        query.status = 'confirmed';
      }
    }

    const bookings = await HotelBooking.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .populate('roomId', 'roomNumber roomType floor')
      .sort({ checkInDate: 1 });

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Get bookings by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bookings by date range',
      error: error.message
    });
  }
};

// Check room availability
export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.query;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, and check-out date are required'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check if room exists and is active
    const room = await HotelRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Room is not active',
        data: {
          isAvailable: false,
          reason: 'Room is not active'
        }
      });
    }

    // Check for overlapping bookings
    const existingBooking = await HotelBooking.findOne({
      roomId: roomId,
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        }
      ],
      status: { $in: ['pending', 'confirmed', 'checked_in'] }
    });

    const isAvailable = !existingBooking && room.isAvailable;

    res.status(200).json({
      success: true,
      message: 'Availability check completed',
      data: {
        roomId,
        checkInDate,
        checkOutDate,
        isAvailable,
        reason: existingBooking ? 'Room is already booked' : 
                !room.isAvailable ? 'Room is currently unavailable' : 
                'Room is available'
      }
    });

  } catch (error) {
    console.error('Check room availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking room availability',
      error: error.message
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user?.roles?.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view statistics.'
      });
    }

    const totalBookings = await HotelBooking.countDocuments();
    const pendingBookings = await HotelBooking.countDocuments({ status: 'pending' });
    const confirmedBookings = await HotelBooking.countDocuments({ status: 'confirmed' });
    const checkedInBookings = await HotelBooking.countDocuments({ status: 'checked_in' });
    const completedBookings = await HotelBooking.countDocuments({ status: 'checked_out' });
    const cancelledBookings = await HotelBooking.countDocuments({ status: 'cancelled' });

    // Get bookings by status
    const statusStats = await HotelBooking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBookings = await HotelBooking.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).countDocuments();

    res.status(200).json({
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        checkedInBookings,
        completedBookings,
        cancelledBookings,
        statusStats,
        recentBookings
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving booking statistics',
      error: error.message
    });
  }
};