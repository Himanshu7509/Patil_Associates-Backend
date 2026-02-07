// Import required packages
import mongoose from 'mongoose';

// Define Restaurant Booking Schema
const restaurantBookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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