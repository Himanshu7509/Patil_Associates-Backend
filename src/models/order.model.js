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

// Pre-save middleware to generate bill number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate bill number: BILL-YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Find the highest bill number for today
    const lastOrder = await this.constructor
      .findOne({ 
        billNumber: new RegExp(`^BILL-${dateStr}-`) 
      })
      .sort({ billNumber: -1 })
      .limit(1);
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.billNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.billNumber = `BILL-${dateStr}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate item totals
  this.orderItems.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
  });
  
  // Calculate subtotal
  this.subtotal = this.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate discount amount
  this.discountAmount = (this.subtotal * this.discountPercentage) / 100;
  
  // Calculate GST amount (on discounted amount)
  const amountAfterDiscount = this.subtotal - this.discountAmount;
  this.gstAmount = (amountAfterDiscount * this.gstPercentage) / 100;
  
  // Calculate final total
  this.totalAmount = amountAfterDiscount + this.gstAmount;
  
  next();
});

// Create and export Order model
const Order = mongoose.model('Order', orderSchema);

export default Order;