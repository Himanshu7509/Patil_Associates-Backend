// Import required packages
import Order from '../models/order.model.js';
import RestaurantBooking from '../models/restaurant.model.js';
import MenuItem from '../models/menu.model.js';
import User from '../models/auth.model.js';
import mongoose from 'mongoose';

// Create a new order from booking
export const createOrderFromBooking = async (req, res) => {
  try {
    console.log('Create order from booking called');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { bookingId, gstPercentage = 18, discountPercentage = 0, billNotes } = req.body;
    
    console.log('Booking ID:', bookingId);
    console.log('GST Percentage:', gstPercentage);
    console.log('Discount Percentage:', discountPercentage);
    
    // Check if booking exists
    const booking = await RestaurantBooking.findById(bookingId)
      .populate('customerId', 'fullName email phoneNo')
      .populate('orderDetails.itemId');
    
    console.log('Booking found:', booking ? 'Yes' : 'No');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if order already exists for this booking
    const existingOrder = await Order.findOne({ bookingId });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order already exists for this booking'
      });
    }
    
    // Validate that booking has order details
    if (!booking.orderDetails || booking.orderDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking does not contain order details. Only bookings with menu items can be converted to orders.'
      });
    }
    
    console.log('Booking order details:', booking.orderDetails);
    
    // Prepare order items
    const orderItems = booking.orderDetails.map(item => {
      const unitPrice = item.price || item.itemId?.price || 0;
      const quantity = item.quantity || 1;
      const totalPrice = unitPrice * quantity;
      
      return {
        itemId: item.itemId?._id || item.itemId || null,
        itemName: item.itemName || item.itemId?.name || 'Unknown Item',
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        category: item.category || item.itemId?.category || 'main_course',
        dietaryOptions: item.dietaryOptions || item.itemId?.dietaryOptions || []
      };
    }).filter(item => item.itemId && item.itemName && item.unitPrice > 0);
    
    console.log('Prepared order items:', orderItems);
    
    // Validate that we have at least one valid order item
    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid order items found in booking'
      });
    }
    
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = (amountAfterDiscount * gstPercentage) / 100;
    const totalAmount = amountAfterDiscount + gstAmount;
    
    // Generate bill number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Find the highest bill number for today
    const lastOrder = await Order
      .findOne({ 
        billNumber: new RegExp(`^BILL-${dateStr}-`) 
      })
      .sort({ billNumber: -1 })
      .limit(1);
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.billNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    const billNumber = `BILL-${dateStr}-${String(sequence).padStart(4, '0')}`;
    
    // Create order
    const orderData = {
      bookingId,
      customerName: booking.customerName || booking.customerId?.fullName || 'Guest Customer',
      customerEmail: booking.customerEmail || booking.customerId?.email || '',
      customerPhone: booking.customerPhone || booking.customerId?.phoneNo || '',
      orderItems,
      tableNumber: booking.tableNumber,
      partySize: booking.partySize,
      subtotal,
      gstPercentage,
      gstAmount,
      discountPercentage,
      discountAmount,
      totalAmount,
      billNumber,
      billNotes,
      createdBy: req.user?._id || new mongoose.Types.ObjectId()
    };
    
    // Only include customerId if it exists (for registered users)
    if (booking.customerId) {
      orderData.customerId = booking.customerId;
    }
    
    console.log('Order data to be created:', orderData);
    
    const newOrder = new Order(orderData);
    await newOrder.save();
    
    console.log('Order saved successfully');
    
    // Populate the created order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('createdBy', 'fullName email')
      .populate('orderItems.itemId');
    
    console.log('Order populated successfully');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get all orders with filtering and pagination
export const getAllOrders = async (req, res) => {
  try {
    const { 
      paymentStatus, 
      customerName, 
      billNumber,
      startDate,
      endDate,
      page = 1, 
      limit = 12 
    } = req.query;
    
    let query = {};
    
    // Apply filters
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (customerName) {
      query.customerName = { $regex: new RegExp(customerName, 'i') };
    }
    
    if (billNumber) {
      query.billNumber = { $regex: new RegExp(billNumber, 'i') };
    }
    
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const totalItems = await Order.countDocuments(query);
    
    // Get paginated results
    const orders = await Order.find(query)
      .populate('customerId', 'fullName email phoneNo')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving orders',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .populate('orderItems.itemId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order',
      error: error.message
    });
  }
};

// Update order (bill details, payment status)
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Only allow updates to certain fields
    const allowedUpdates = [
      'gstPercentage', 
      'discountPercentage', 
      'billNotes', 
      'paymentStatus',
      'paymentMethod',
      'paymentReference'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });
    
    // Add updatedBy field
    updates.updatedBy = req.user._id;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('customerId', 'fullName email phoneNo')
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email')
    .populate('orderItems.itemId');
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
    
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await Order.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      todayOrders,
      totalRevenue,
      todayRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'pending' }),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ 
        createdAt: { $gte: startOfDay, $lte: endOfDay } 
      }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        totalOrders,
        pendingOrders,
        paidOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order statistics',
      error: error.message
    });
  }
};

// Generate printable bill format
export const generateBill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('customerId', 'fullName email phoneNo')
      .populate('createdBy', 'fullName')
      .populate('orderItems.itemId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Format bill data for printing
    const billData = {
      billNumber: order.billNumber,
      billDate: order.billDate,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone
      },
      tableNumber: order.tableNumber,
      partySize: order.partySize,
      items: order.orderItems.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        category: item.category
      })),
      calculations: {
        subtotal: order.subtotal,
        discountPercentage: order.discountPercentage,
        discountAmount: order.discountAmount,
        gstPercentage: order.gstPercentage,
        gstAmount: order.gstAmount,
        totalAmount: order.totalAmount
      },
      payment: {
        status: order.paymentStatus,
        method: order.paymentMethod,
        reference: order.paymentReference
      },
      notes: order.billNotes,
      generatedBy: order.createdBy?.fullName,
      generatedAt: order.createdAt
    };
    
    res.status(200).json({
      success: true,
      message: 'Bill generated successfully',
      data: billData
    });
    
  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating bill',
      error: error.message
    });
  }
};