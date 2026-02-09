// Import required packages
import mongoose from 'mongoose';

// Define Property Schema
const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  propertyType: {
    type: String,
    required: false,
    enum: ['residential', 'commercial', 'industrial', 'agricultural', 'land', 'mixed_use'],
    default: 'residential'
  },
  listingType: {
    type: String,
    required: false,
    enum: ['sale', 'rent', 'lease'],
    default: 'sale'
  },
  address: {
    street: {
      type: String,
      required: false,
      trim: true
    },
    city: {
      type: String,
      required: false,
      trim: true
    },
    state: {
      type: String,
      required: false,
      trim: true
    },
    zipCode: {
      type: String,
      required: false,
      trim: true
    },
    country: {
      type: String,
      required: false,
      trim: true,
      default: 'India'
    }
  },
  price: {
    type: Number,
    required: false,
    min: 0
  },
  area: {
    type: Number,
    required: false,
    min: 0
  },
  areaUnit: {
    type: String,
    required: false,
    enum: ['sqft', 'sqm', 'acres', 'hectares'],
    default: 'sqft'
  },
  bedrooms: {
    type: Number,
    required: false,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: false,
    min: 0
  },
  parking: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  amenities: [{
    type: String,
    required: false
  }],
  features: [{
    type: String,
    required: false
  }],
  images: [{
    type: String,
    required: false,
    trim: true
  }],
  isActive: {
    type: Boolean,
    required: false,
    default: true
  },
  isFeatured: {
    type: Boolean,
    required: false,
    default: false
  },
  contactInfo: {
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
    }
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Property model
const Property = mongoose.model('Property', propertySchema);

export default Property;