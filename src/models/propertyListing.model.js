// Import required packages
import mongoose from 'mongoose';

// Define Property Listing Schema
const propertyListingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  listingType: {
    type: String,
    required: false,
    enum: ['inquiry', 'offer', 'booking', 'sold', 'rented'],
    default: 'inquiry'
  },
  status: {
    type: String,
    required: false,
    enum: ['pending', 'reviewed', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerInfo: {
    name: {
      type: String,
      required: false,
      trim: true
    },
    email: {
      type: String,
      required: false,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    message: {
      type: String,
      required: false,
      trim: true
    }
  },
  offerPrice: {
    type: Number,
    required: false,
    min: 0
  },
  proposedRent: {
    type: Number,
    required: false,
    min: 0
  },
  leaseDuration: {
    type: String,
    required: false,
    trim: true
  },
  moveInDate: {
    type: Date,
    required: false
  },
  viewingSchedule: {
    date: {
      type: Date,
      required: false
    },
    time: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: false,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  paymentInfo: {
    amount: {
      type: Number,
      required: false,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: false,
      enum: ['cash', 'bank_transfer', 'cheque', 'online_payment']
    },
    paymentStatus: {
      type: String,
      required: false,
      enum: ['pending', 'partial', 'completed', 'refunded'],
      default: 'pending'
    }
  },
  documents: [{
    name: {
      type: String,
      required: false,
      trim: true
    },
    url: {
      type: String,
      required: false,
      trim: true
    },
    type: {
      type: String,
      required: false,
      trim: true
    }
  }],
  notes: {
    type: String,
    required: false,
    trim: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Property Listing model
const PropertyListing = mongoose.model('PropertyListing', propertyListingSchema);

export default PropertyListing;