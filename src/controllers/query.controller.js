import Query from '../models/query.model.js';

// Create a new query
export const createQuery = async (req, res) => {
  try {
    const { fullName, email, phone, message, product, source } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phone || !message || !product) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        requiredFields: ['fullName', 'email', 'phone', 'message', 'product']
      });
    }

    // Create new query
    const newQuery = await Query.create({
      fullName,
      email,
      phone,
      message,
      product,
      source: source || 'website'
    });

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      data: newQuery
    });

  } catch (error) {
    console.error('Create query error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error submitting query',
      error: error.message
    });
  }
};

// Get all queries (Admin only)
export const getAllQueries = async (req, res) => {
  try {
    const { product, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (product) {
      query.product = product;
    }
    
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalItems = await Query.countDocuments(query);
    
    // Get paginated results
    const queries = await Query.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Queries retrieved successfully',
      data: queries,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1
      },
      count: queries.length
    });

  } catch (error) {
    console.error('Get all queries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving queries',
      error: error.message
    });
  }
};

// Get a single query by ID (Admin only)
export const getQueryById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await Query.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Query retrieved successfully',
      data: query
    });

  } catch (error) {
    console.error('Get query by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving query',
      error: error.message
    });
  }
};

// Update query status (Admin only)
export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const query = await Query.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Update status
    query.status = status;
    await query.save();

    res.status(200).json({
      success: true,
      message: 'Query status updated successfully',
      data: query
    });

  } catch (error) {
    console.error('Update query status error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating query status',
      error: error.message
    });
  }
};

// Delete a query (Admin only)
export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await Query.findByIdAndDelete(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Query deleted successfully'
    });

  } catch (error) {
    console.error('Delete query error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting query',
      error: error.message
    });
  }
};

// Get query statistics (Admin only)
export const getQueryStats = async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();
    
    // Get queries by product
    const productStats = await Query.aggregate([
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get queries by status
    const statusStats = await Query.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent queries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentQueries = await Query.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      message: 'Query statistics retrieved successfully',
      data: {
        totalQueries,
        productStats,
        statusStats,
        recentQueries,
        dateRange: {
          from: sevenDaysAgo,
          to: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Get query stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving query statistics',
      error: error.message
    });
  }
};