// Import required packages
import RestaurantBooking from '../models/restaurant.model.js';

// Create a new restaurant booking
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // Debug: Log user info
    console.log('User from token:', req.user);
    console.log('Request headers:', req.headers.authorization);

    // If user is authenticated, associate the booking with the user
    if (req.user) {
      bookingData.customerId = req.user._id;
      console.log('Associated booking with user:', req.user._id);
    } else {
      console.log('No user found in request - booking will be created without user association');
    }

    // Create new booking
    const newBooking = await RestaurantBooking.create(bookingData);

    // Populate user details if customerId exists
    const populatedBooking = await RestaurantBooking.findById(newBooking._id)
      .populate('customerId', 'fullName email phoneNo');

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

// Get all restaurant bookings
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
        // If not logged in, only show confirmed bookings
        query.status = 'confirmed';
        console.log('No user, querying only confirmed bookings');
      }
    }

    const bookings = await RestaurantBooking.find(query)
      .populate('customerId', 'fullName email phoneNo')
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

// Get a single restaurant booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await RestaurantBooking.findById(id).populate('customerId', 'fullName email phoneNo');

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

// Update a restaurant booking by ID
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await RestaurantBooking.findById(id);

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

    const updatedBooking = await RestaurantBooking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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

// Delete a restaurant booking by ID
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await RestaurantBooking.findById(id);

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

    await RestaurantBooking.findByIdAndDelete(id);

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
    const { startDate, endDate } = req.query;

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
      bookingDate: { $gte: start, $lte: end }
    };
    
    if (!isAdmin) {
      // If not admin, only show bookings for the current user
      if (req.user) {
        query.customerId = req.user._id;
      } else {
        // If not logged in, only show confirmed bookings
        query.status = 'confirmed';
      }
    }

    const bookings = await RestaurantBooking.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .sort({ bookingDate: 1, bookingTime: 1 });

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

// Get available tables for a specific date and time
export const getAvailableTables = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // Find all bookings for the given date and time
    const existingBookings = await RestaurantBooking.find({
      bookingDate: new Date(date),
      bookingTime: time,
      status: { $ne: 'cancelled' } // Exclude cancelled bookings
    });

    // Get all table numbers that are booked
    const bookedTableNumbers = existingBookings.map(booking => booking.tableNumber).filter(table => table);

    // In a real application, you would have a predefined list of tables
    // For now, we'll just return which tables are available
    const totalTables = 20; // Assuming 20 tables
    const allTableNumbers = Array.from({ length: totalTables }, (_, i) => `${i + 1}`);
    const availableTables = allTableNumbers.filter(table => !bookedTableNumbers.includes(table));

    res.status(200).json({
      success: true,
      message: 'Available tables retrieved successfully',
      data: {
        date,
        time,
        availableTables,
        bookedTables: bookedTableNumbers,
        totalAvailable: availableTables.length
      }
    });

  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving available tables',
      error: error.message
    });
  }
};