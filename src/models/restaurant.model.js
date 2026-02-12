// Import required packages
import mongoose from 'mongoose';

// Define Restaurant Booking Schema
const restaurantBookingSchema = new mongoose.Schema({
  // Customer identification (either authenticated or guest)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Guest customer details (when not logged in)
  customerName: {
    type: String,
    required: false,
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
  partySize: {
    type: Number,
    required: false,
    min: 1,
    max: 20
  },
  bookingDate: {
    type: Date,
    required: false
  },
  bookingTime: {
    type: String, // Format: "HH:MM" 
    required: false,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  specialRequests: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  tableNumber: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    required: false,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookingType: {
    type: String,
    required: false,
    enum: ['table', 'event', 'private_dining', 'regular'],
    default: 'table'
  },
  // Order details when booking with food items
  orderDetails: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: false
    },
    itemName: {
      type: String,
      required: false,
      trim: true
    },
    quantity: {
      type: Number,
      required: false,
      min: 1
    },
    price: {
      type: Number,
      required: false,
      min: 0
    },
    description: {
      type: String,
      required: false,
      trim: true
    },
    category: {
      type: String,
      required: false,
      enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'alcoholic_beverage', 'non_alcoholic_beverage', 'specials']
    },
    ingredients: [{
      type: String,
      required: false
    }],
    dietaryOptions: [{
      type: String,
      required: false,
      enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher']
    }],
    image: {
      type: String,
      required: false,
      trim: true
    },
    cookingTime: {
      type: Number, // in minutes
      required: false,
      min: 0
    }
  }],
  // Table details when booking with specific table information
  tableDetails: [{
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: false
    },
    tableNumber: {
      type: String,
      required: false,
      trim: true
    },
    capacity: {
      type: Number,
      required: false,
      min: 1
    },
    location: {
      type: String,
      required: false,
      enum: ['indoor', 'outdoor', 'patio', 'vip', 'bar_area']
    },
    shape: {
      type: String,
      required: false,
      enum: ['round', 'square', 'rectangle', 'oval', 'semi_circle']
    },
    features: [{
      type: String,
      required: false,
      enum: ['window_view', 'quiet_corner', 'near_bar', 'accessible', 'high_top', 'booth']
    }],
    isActive: {
      type: Boolean,
      required: false,
      default: true
    },
    notes: {
      type: String,
      required: false,
      trim: true
    }
  }],
  totalAmount: {
    type: Number,
    required: false,
    min: 0
  },
  notes: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Restaurant Booking model
const RestaurantBooking = mongoose.model('RestaurantBooking', restaurantBookingSchema);

export default RestaurantBooking;