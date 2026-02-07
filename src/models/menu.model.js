// Import required packages
import mongoose from 'mongoose';

// Define Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: false,
    min: 0
  },
  category: {
    type: String,
    required: false,
    enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'alcoholic_beverage', 'non_alcoholic_beverage', 'specials'],
    default: 'main_course'
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
  isActive: {
    type: Boolean,
    required: false,
    default: true
  },
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
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export Menu Item model
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;