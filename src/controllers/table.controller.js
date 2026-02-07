// Import required packages
import Table from '../models/table.model.js';

// Create a new table
export const createTable = async (req, res) => {
  try {
    const tableData = req.body;
    
    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber: tableData.tableNumber });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'Table with this number already exists'
      });
    }

    const newTable = await Table.create(tableData);

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: newTable
    });

  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating table',
      error: error.message
    });
  }
};

// Get all tables
export const getAllTables = async (req, res) => {
  try {
    const { isActive, location, capacity } = req.query;
    
    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (location) {
      query.location = location;
    }
    
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    const tables = await Table.find(query).sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      message: 'Tables retrieved successfully',
      data: tables,
      count: tables.length
    });

  } catch (error) {
    console.error('Get all tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving tables',
      error: error.message
    });
  }
};

// Get a single table by ID
export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Table retrieved successfully',
      data: table
    });

  } catch (error) {
    console.error('Get table by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving table',
      error: error.message
    });
  }
};

// Update a table by ID
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if table exists
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // If updating table number, check if it already exists
    if (updateData.tableNumber && updateData.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ 
        tableNumber: updateData.tableNumber,
        _id: { $ne: id }
      });
      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: 'Table with this number already exists'
        });
      }
    }

    const updatedTable = await Table.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      data: updatedTable
    });

  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating table',
      error: error.message
    });
  }
};

// Delete a table by ID
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    await Table.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });

  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting table',
      error: error.message
    });
  }
};

// Get available tables for a specific date, time and party size
export const getAvailableTablesByCriteria = async (req, res) => {
  try {
    const { date, time, partySize, location } = req.query;

    if (!date || !time || !partySize) {
      return res.status(400).json({
        success: false,
        message: 'Date, time, and party size are required'
      });
    }

    // Find all bookings for the given date and time (excluding cancelled)
    const { default: RestaurantBooking } = await import('../models/restaurant.model.js');
    
    const existingBookings = await RestaurantBooking.find({
      bookingDate: new Date(date),
      bookingTime: time,
      status: { $ne: 'cancelled' }
    });

    // Get all booked table numbers
    const bookedTableNumbers = existingBookings
      .map(booking => booking.tableNumber)
      .filter(table => table);

    // Build query for available tables
    let tableQuery = {
      isActive: true,
      capacity: { $gte: parseInt(partySize) },
      tableNumber: { $nin: bookedTableNumbers }
    };

    if (location) {
      tableQuery.location = location;
    }

    const availableTables = await Table.find(tableQuery).sort({ capacity: 1, tableNumber: 1 });

    res.status(200).json({
      success: true,
      message: 'Available tables retrieved successfully',
      data: {
        date,
        time,
        partySize: parseInt(partySize),
        location: location || 'all',
        availableTables,
        totalAvailable: availableTables.length,
        bookedCount: bookedTableNumbers.length
      }
    });

  } catch (error) {
    console.error('Get available tables by criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving available tables',
      error: error.message
    });
  }
};