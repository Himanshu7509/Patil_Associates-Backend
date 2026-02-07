// Import required packages
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  phoneNo: {
    type: String,
    required: false,
    trim: true
  },
  roles: {
    type: [String],
    required: true,
    default: ["customer"],
    enum: ["customer", "admin"]
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export User model
const User = mongoose.model('User', userSchema);

export default User;
