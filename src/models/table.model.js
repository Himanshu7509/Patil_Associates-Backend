// Import required packages
import mongoose from 'mongoose';

// Define Table Schema
const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: false,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: false,
    min: 1,
    max: 20
  },
  location: {
    type: String,
    required: false,
    enum: ['indoor', 'outdoor', 'patio', 'vip', 'bar_area'],
    default: 'indoor'
  },
  shape: {
    type: String,
    required: false,
    enum: ['round', 'square', 'rectangle', 'oval', 'semi_circle'],
    default: 'round'
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
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Table model
const Table = mongoose.model('Table', tableSchema);

export default Table;