import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  product: {
    type: String,
    required: [true, 'Product is required'],
    enum: {
      values: ['bar & restaurant', 'hotel', 'properties'],
      message: 'Product must be either bar & restaurant, hotel, or properties'
    }
  },
  source: {
    type: String,
    enum: {
      values: ['website', 'referral', 'advertisement', 'other'],
      message: 'Source must be website, referral, advertisement, or other'
    },
    default: 'website'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'reviewed', 'contacted', 'resolved', 'closed'],
      message: 'Status must be pending, reviewed, contacted, resolved, or closed'
    },
    default: 'pending'
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Index for better query performance
querySchema.index({ product: 1, status: 1 });
querySchema.index({ createdAt: -1 });

const Query = mongoose.model('Query', querySchema);

export default Query;