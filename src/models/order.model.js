// Import required packages
import mongoose from 'mongoose';

// Define Order Schema
const orderSchema = new mongoose.Schema({
  // Reference to the original restaurant booking
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantBooking',
    required: true
  },
  
  // Customer information (copied from booking for reference)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: false,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  customerPhone: {
    type: String,
    required: false,
    trim: true
  },
  
  // Order details (copied from booking)
  orderItems: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: false,
      enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'alcoholic_beverage', 'non_alcoholic_beverage', 'specials']
    },
    dietaryOptions: [{
      type: String,
      required: false,
      enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher']
    }]
  }],
  
  // Table information
  tableNumber: {
    type: String,
    required: false,
    trim: true
  },
  partySize: {
    type: Number,
    required: false,
    min: 1
  },
  
  // Billing information
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  gstPercentage: {
    type: Number,
    required: false,
    default: 18, // Default GST percentage
    min: 0,
    max: 100
  },
  gstAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: false,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'other']
  },
  paymentReference: {
    type: String,
    required: false,
    trim: true
  },
  
  // Bill information
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  billDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  billNotes: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  
  // Staff information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create index for better query performance
orderSchema.index({ billNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// NOTE: All calculations are now handled in the controller to avoid validation issues
// The pre-save middleware has been removed since we calculate values explicitly

// Create and export Order model
const Order = mongoose.model('Order', orderSchema);

export default Order;