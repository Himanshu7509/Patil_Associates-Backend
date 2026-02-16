import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import dbConnect from "./src/utils/mongodb.js";
import authRoutes from './src/routes/auth.route.js';
import restaurantRoutes from './src/routes/restaurant.route.js';
import tableRoutes from './src/routes/table.route.js';
import menuRoutes from './src/routes/menu.route.js';
import hotelRoomRoutes from './src/routes/hotelRoom.route.js';
import hotelBookingRoutes from './src/routes/hotelBooking.route.js';
import propertyRoutes from './src/routes/property.route.js';
import propertyListingRoutes from './src/routes/propertyListing.route.js';
import billingRoutes from './src/routes/billing.route.js';
import userRoutes from './src/routes/admin/user.route.js';
import profileRoutes from './src/routes/profile.route.js';
import queryRoutes from './src/routes/query.route.js';

dotenv.config();
const app = express();
app.set('trust proxy', 1);
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://www.patilbars.in',
  'https://patilbars.in',
  'https://www.patilassociates.in',
  'https://admin.patilassociates.in/',
  'https://patilassociates.in',
  'https://elite-cards-admin-panel.vercel.app'
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
dbConnect();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/hotel/rooms', hotelRoomRoutes);
app.use('/api/hotel/bookings', hotelBookingRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/property-listings', propertyListingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/queries', queryRoutes);

app.get("/", (req, res) => {
  res.send("Patil Associates Unified Backend API is running...");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://${process.env.HOST || 'localhost'}:${PORT}`));

export default app;