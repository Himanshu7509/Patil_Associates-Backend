import User from '../models/auth.model.js';
import HotelRoom from '../models/hotelRoom.model.js';
import HotelBooking from '../models/hotelBooking.model.js';
import Restaurant from '../models/restaurant.model.js';
import Table from '../models/table.model.js';
import Menu from '../models/menu.model.js';
import Property from '../models/property.model.js';
import PropertyListing from '../models/propertyListing.model.js';
import Query from '../models/query.model.js';
import Order from '../models/order.model.js';

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all major entities
    const [
      totalUsers,
      totalHotelRooms,
      totalHotels,
      totalRestaurants,
      totalProperties,
      totalPropertyListings,
      totalQueries,
      totalOrders,
      activeHotelBookings,
      activeRestaurantBookings
    ] = await Promise.all([
      User.countDocuments(),
      HotelRoom.countDocuments(),
      HotelRoom.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ isActive: true }),
      Property.countDocuments({ isActive: true }),
      PropertyListing.countDocuments(),
      Query.countDocuments(),
      Order.countDocuments(),
      HotelBooking.countDocuments({ status: { $in: ['pending', 'confirmed', 'checked_in'] } }),
      0 // TODO: Add restaurant booking count when model is available
    ]);

    // Get revenue statistics
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get booking statistics
    const bookingStats = await HotelBooking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user registration trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const userRegistrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get room occupancy rates
    const occupiedRooms = await HotelRoom.countDocuments({ 
      isActive: true, 
      isAvailable: false 
    });
    
    const totalActiveRooms = await HotelRoom.countDocuments({ isActive: true });
    const occupancyRate = totalActiveRooms > 0 ? 
      Math.round((occupiedRooms / totalActiveRooms) * 100) : 0;

    // Get property listing statistics by type
    const propertyTypeStats = await Property.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent queries by product
    const recentQueries = await Query.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalUsers,
          totalHotelRooms,
          totalHotels,
          totalRestaurants,
          totalProperties,
          totalPropertyListings,
          totalQueries,
          totalOrders,
          activeBookings: activeHotelBookings + activeRestaurantBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentRevenue: recentRevenue[0]?.total || 0,
          occupancyRate
        },
        bookingStats,
        userRegistrationTrend,
        propertyTypeStats,
        recentQueries,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics',
      error: error.message
    });
  }
};

// Get revenue analytics with time-based filtering
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      dateFilter = {
        createdAt: { $gte: twelveMonthsAgo }
      };
    }

    // Revenue by time period
    let groupBy;
    switch (period) {
      case 'day':
        groupBy = {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        };
        break;
      case 'week':
        groupBy = {
          $dateToString: {
            format: '%Y-%U',
            date: '$createdAt'
          }
        };
        break;
      case 'month':
        groupBy = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt'
          }
        };
        break;
      case 'year':
        groupBy = {
          $dateToString: {
            format: '%Y',
            date: '$createdAt'
          }
        };
        break;
      default:
        groupBy = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt'
          }
        };
    }

    const revenueTrend = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by service type
    const revenueByService = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: {
        revenueTrend,
        revenueByService,
        period,
        dateRange: {
          startDate: dateFilter.createdAt?.$gte || '12 months ago',
          endDate: dateFilter.createdAt?.$lte || 'now'
        }
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving revenue analytics',
      error: error.message
    });
  }
};

// Get booking analytics
export const getBookingAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy;
    switch (period) {
      case 'day':
        groupBy = {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        };
        break;
      case 'week':
        groupBy = {
          $dateToString: {
            format: '%Y-%U',
            date: '$createdAt'
          }
        };
        break;
      case 'month':
        groupBy = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt'
          }
        };
        break;
      default:
        groupBy = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt'
          }
        };
    }

    // Booking trends
    const bookingTrends = await HotelBooking.aggregate([
      {
        $group: {
          _id: {
            date: groupBy,
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Room type popularity
    const roomTypeStats = await HotelBooking.aggregate([
      {
        $lookup: {
          from: 'hotelrooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'roomInfo'
        }
      },
      { $unwind: '$roomInfo' },
      {
        $group: {
          _id: '$roomInfo.roomType',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    // Occupancy by floor
    const floorOccupancy = await HotelRoom.aggregate([
      {
        $group: {
          _id: '$floor',
          totalRooms: { $sum: 1 },
          occupiedRooms: {
            $sum: {
              $cond: [{ $eq: ['$isAvailable', false] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          floor: '$_id',
          totalRooms: 1,
          occupiedRooms: 1,
          occupancyRate: {
            $multiply: [
              { $divide: ['$occupiedRooms', '$totalRooms'] },
              100
            ]
          }
        }
      },
      { $sort: { floor: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Booking analytics retrieved successfully',
      data: {
        bookingTrends,
        roomTypeStats,
        floorOccupancy,
        period
      }
    });

  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving booking analytics',
      error: error.message
    });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    // User registration trends
    const userTrends = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User roles distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Active vs inactive users
    const activeInactiveStats = await User.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'User analytics retrieved successfully',
      data: {
        userTrends,
        roleDistribution,
        activeInactiveStats
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user analytics',
      error: error.message
    });
  }
};

// Get property analytics
export const getPropertyAnalytics = async (req, res) => {
  try {
    // Property listings by status
    const listingStatusStats = await PropertyListing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    // Properties by type
    const propertyTypeStats = await Property.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent property inquiries (queries)
    const propertyInquiries = await Query.aggregate([
      { $match: { product: 'properties' } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Property analytics retrieved successfully',
      data: {
        listingStatusStats,
        propertyTypeStats,
        propertyInquiries
      }
    });

  } catch (error) {
    console.error('Get property analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property analytics',
      error: error.message
    });
  }
};

// Get real-time dashboard data
export const getRealTimeStats = async (req, res) => {
  try {
    const [
      onlineUsers,
      pendingBookings,
      todayRevenue,
      activeQueries
    ] = await Promise.all([
      0, // TODO: Implement session tracking for online users
      HotelBooking.countDocuments({ status: 'pending' }),
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Query.countDocuments({ status: 'pending' })
    ]);

    res.status(200).json({
      success: true,
      message: 'Real-time stats retrieved successfully',
      data: {
        onlineUsers,
        pendingBookings,
        todayRevenue: todayRevenue[0]?.total || 0,
        activeQueries,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Get real-time stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving real-time statistics',
      error: error.message
    });
  }
};