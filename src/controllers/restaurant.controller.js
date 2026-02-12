// Import required packages
import RestaurantBooking from '../models/restaurant.model.js';

// Create a new restaurant booking
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // If user is authenticated, associate the booking with the user
    if (req.user) {
      // For authenticated users, use their account details
      bookingData.customerId = req.user._id;
      console.log('Associated booking with authenticated user:', req.user._id);
      
      // If customer details are not provided, use user's account details
      if (!bookingData.customerName) {
        bookingData.customerName = req.user.fullName;
      }
      if (!bookingData.customerEmail) {
        bookingData.customerEmail = req.user.email;
      }
      if (!bookingData.customerPhone) {
        bookingData.customerPhone = req.user.phoneNo;
      }
    } else {
      // For unauthenticated users, require customer details
      if (!bookingData.customerName || (!bookingData.customerEmail && !bookingData.customerPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Customer name and either email or phone number are required for bookings'
        });
      }
      console.log('Creating booking for guest customer:', bookingData.customerName);
    }

    // Debug: Log user info
    console.log('User from token:', req.user);
    console.log('Request headers:', req.headers.authorization);

    // Process order details to include full menu item information before saving
    if (bookingData.orderDetails && bookingData.orderDetails.length > 0) {
      const { default: MenuItem } = await import('./../models/menu.model.js');
      for (let i = 0; i < bookingData.orderDetails.length; i++) {
        const orderDetail = bookingData.orderDetails[i];
        // Check if orderDetail has itemId or if it's a full menu item object
        const itemId = orderDetail.itemId || orderDetail._id;
        if (itemId) {
          const menuItem = await MenuItem.findById(itemId);
          if (menuItem) {
            // Enhance the order detail with full menu item information
            bookingData.orderDetails[i] = {
              itemId: menuItem._id,
              itemName: menuItem.name,
              quantity: orderDetail.quantity || 1,
              price: orderDetail.price || menuItem.price,
              description: menuItem.description,
              category: menuItem.category,
              dietaryOptions: menuItem.dietaryOptions,
              image: menuItem.image,
              cookingTime: menuItem.cookingTime,
              ingredients: menuItem.ingredients
            };
          }
        }
      }
    }

    // Create new booking with enriched data
    const newBooking = await RestaurantBooking.create(bookingData);

    // Populate user details if customerId exists
    const populatedBooking = await RestaurantBooking.findById(newBooking._id)
      .populate('customerId', 'fullName email phoneNo');

    // Populate table details if tableNumber is provided
    if (populatedBooking.tableNumber) {
      const { default: Table } = await import('./../models/table.model.js');
      const table = await Table.findOne({ tableNumber: populatedBooking.tableNumber });
      if (table) {
        populatedBooking.tableDetails = [{
          tableId: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          location: table.location,
          shape: table.shape,
          features: table.features,
          isActive: table.isActive,
          notes: table.notes
        }];
      }
    }

    // Populate table details if tableNumber is provided
    if (populatedBooking.tableNumber) {
      const { default: Table } = await import('./../models/table.model.js');
      const table = await Table.findOne({ tableNumber: populatedBooking.tableNumber });
      if (table) {
        populatedBooking.tableDetails = [{
          tableId: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          location: table.location,
          shape: table.shape,
          features: table.features,
          isActive: table.isActive,
          notes: table.notes
        }];
      }
    }

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
        // If not logged in, deny access to all bookings
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view all bookings'
        });
      }
    }

    const bookings = await RestaurantBooking.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .sort({ createdAt: -1 });

    // Populate order details with full MenuItem information for each booking
    const { default: MenuItem } = await import('./../models/menu.model.js');
    const { default: Table } = await import('./../models/table.model.js');
    
    for (let j = 0; j < bookings.length; j++) {
      const booking = bookings[j];
      
      // Populate order details with full MenuItem information
      if (booking.orderDetails && booking.orderDetails.length > 0) {
        for (let i = 0; i < booking.orderDetails.length; i++) {
          const orderDetail = booking.orderDetails[i];
          // Check if orderDetail has itemId or if it's a full menu item object
          const itemId = orderDetail.itemId || orderDetail._id;
          if (itemId) {
            const menuItem = await MenuItem.findById(itemId);
            if (menuItem) {
              // Replace the order detail with full information
              booking.orderDetails[i] = {
                itemId: menuItem._id,
                itemName: menuItem.name,
                quantity: orderDetail.quantity || 1,
                price: orderDetail.price || menuItem.price,
                description: menuItem.description,
                category: menuItem.category,
                dietaryOptions: menuItem.dietaryOptions,
                image: menuItem.image,
                cookingTime: menuItem.cookingTime,
                ingredients: menuItem.ingredients
              };
            }
          }
        }
      }

      // Populate table details if tableNumber is provided
      if (booking.tableNumber) {
        const table = await Table.findOne({ tableNumber: booking.tableNumber });
        if (table) {
          booking.tableDetails = [{
            tableId: table._id,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location,
            shape: table.shape,
            features: table.features,
            isActive: table.isActive,
            notes: table.notes
          }];
        }
      }
    }

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
    
    // Allow access if:
    // 1. User is admin
    // 2. User is authenticated and booking belongs to them
    // 3. Booking has customer details and matches the guest details provided (if implemented)
    if (!isAdmin) {
      if (req.user) {
        // Authenticated user accessing their own booking
        if (booking.customerId && booking.customerId._id.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else {
        // Unauthenticated user - could add additional validation here if needed
        // For now, we'll allow access since the booking may have been created without auth
        // But in production, you might want to implement additional security measures
      }
    }

    // Populate order details with full MenuItem information
    if (booking.orderDetails && booking.orderDetails.length > 0) {
      const { default: MenuItem } = await import('./../models/menu.model.js');
      for (let i = 0; i < booking.orderDetails.length; i++) {
        const orderDetail = booking.orderDetails[i];
        if (orderDetail.itemId) {
          const menuItem = await MenuItem.findById(orderDetail.itemId);
          if (menuItem) {
            // Replace the order detail with full information
            booking.orderDetails[i] = {
              itemId: menuItem._id,
              itemName: menuItem.name,
              quantity: orderDetail.quantity || 1,
              price: orderDetail.price || menuItem.price,
              description: menuItem.description,
              category: menuItem.category,
              dietaryOptions: menuItem.dietaryOptions,
              image: menuItem.image,
              cookingTime: menuItem.cookingTime
            };
          }
        }
      }
    }

    // Populate table details if tableNumber is provided
    if (booking.tableNumber) {
      const { default: Table } = await import('./../models/table.model.js');
      const table = await Table.findOne({ tableNumber: booking.tableNumber });
      if (table) {
        booking.tableDetails = {
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          location: table.location,
          shape: table.shape,
          features: table.features,
          isActive: table.isActive,
          notes: table.notes
        };
      }
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
        // If not logged in, only show confirmed bookings without customer details
        query.status = 'confirmed';
      }
    }

    const bookings = await RestaurantBooking.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .sort({ bookingDate: 1, bookingTime: 1 });

    // Populate order details with full MenuItem information for each booking
    const { default: MenuItem } = await import('./../models/menu.model.js');
    const { default: Table } = await import('./../models/table.model.js');
    
    for (let j = 0; j < bookings.length; j++) {
      const booking = bookings[j];
      
      // Populate order details with full MenuItem information
      if (booking.orderDetails && booking.orderDetails.length > 0) {
        for (let i = 0; i < booking.orderDetails.length; i++) {
          const orderDetail = booking.orderDetails[i];
          // Check if orderDetail has itemId or if it's a full menu item object
          const itemId = orderDetail.itemId || orderDetail._id;
          if (itemId) {
            const menuItem = await MenuItem.findById(itemId);
            if (menuItem) {
              // Replace the order detail with full information
              booking.orderDetails[i] = {
                itemId: menuItem._id,
                itemName: menuItem.name,
                quantity: orderDetail.quantity || 1,
                price: orderDetail.price || menuItem.price,
                description: menuItem.description,
                category: menuItem.category,
                dietaryOptions: menuItem.dietaryOptions,
                image: menuItem.image,
                cookingTime: menuItem.cookingTime,
                ingredients: menuItem.ingredients
              };
            }
          }
        }
      }

      // Populate table details if tableNumber is provided
      if (booking.tableNumber) {
        const table = await Table.findOne({ tableNumber: booking.tableNumber });
        if (table) {
          booking.tableDetails = [{
            tableId: table._id,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location,
            shape: table.shape,
            features: table.features,
            isActive: table.isActive,
            notes: table.notes
          }];
        }
      }
    }

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