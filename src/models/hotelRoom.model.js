// Import required packages
import mongoose from 'mongoose';

// Define Hotel Room Schema
const hotelRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: false,
    trim: true,
    unique: true
  },
  roomType: {
    type: String,
    required: false,
    enum: ['single', 'double', 'twin', 'suite', 'deluxe', 'family', 'presidential'],
    default: 'single'
  },
  floor: {
    type: Number,
    required: false,
    min: 1
  },
  capacity: {
    type: Number,
    required: false,
    min: 1,
    max: 10
  },
  pricePerNight: {
    type: Number,
    required: false,
    min: 0
  },
  amenities: [{
    type: String,
    required: false
  }],
  viewType: {
    type: String,
    required: false,
    enum: ['city', 'ocean', 'mountain', 'garden', 'pool', 'none'],
    default: 'none'
  },
  bedType: {
    type: String,
    required: false,
    enum: ['single', 'double', 'queen', 'king', 'sofa_bed'],
    default: 'single'
  },
  size: {
    type: Number, // in square feet
    required: false,
    min: 0
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String,
    required: false,
    trim: true
  }],
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  },
  maintenanceNotes: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Hotel Room model
const HotelRoom = mongoose.model('HotelRoom', hotelRoomSchema);

export default HotelRoom;