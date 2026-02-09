// Import required packages
import mongoose from 'mongoose';

// Define Hotel Booking Schema
const hotelBookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelRoom',
    required: false
  },
  checkInDate: {
    type: Date,
    required: false
  },
  checkOutDate: {
    type: Date,
    required: false
  },
  numberOfGuests: {
    type: Number,
    required: false,
    min: 1,
    max: 20
  },
  totalPrice: {
    type: Number,
    required: false,
    min: 0
  },
  status: {
    type: String,
    required: false,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  guestName: {
    type: String,
    required: false,
    trim: true
  },
  guestEmail: {
    type: String,
    required: false,
    trim: true
  },
  guestPhone: {
    type: String,
    required: false,
    trim: true
  },
  paymentStatus: {
    type: String,
    required: false,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: false,
    enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'paypal', 'other']
  },
  bookingSource: {
    type: String,
    required: false,
    enum: ['website', 'phone', 'walk_in', 'travel_agent', 'booking_com', 'expedia', 'other'],
    default: 'website'
  },
  notes: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Hotel Booking model
const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);

export default HotelBooking;