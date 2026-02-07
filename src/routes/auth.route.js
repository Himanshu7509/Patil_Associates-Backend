// Import Express Router and auth controller
import express from 'express';
import { signup, login } from '../controllers/auth.controller.js';

const router = express.Router();

// Define auth routes
router.post('/signup', signup);
router.post('/login', login);

export default router;
