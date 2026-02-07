import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import dbConnect from "./src/utils/mongodb.js";
import authRoutes from './src/routes/auth.route.js';
import restaurantRoutes from './src/routes/restaurant.route.js';
import tableRoutes from './src/routes/table.route.js';
import menuRoutes from './src/routes/menu.route.js';

dotenv.config();
const app = express();

app.use(cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
dbConnect();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);

app.get("/", (req, res) => {
  res.send("Patil Associates Unified Backend API is running...");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://${process.env.HOST || 'localhost'}:${PORT}`));

export default app;