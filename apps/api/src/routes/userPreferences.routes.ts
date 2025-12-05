import express from 'express';
import { UserPreferencesController } from '../controllers/userPreferences.controller';
import { auth } from '../middleware/auth';
import { UserService } from '../services/UserService';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth(new UserService()));

// Get user notification preferences
router.get('/', UserPreferencesController.getUserPreferences);

// Save user notification preferences
router.post('/', UserPreferencesController.saveUserPreferences);

// Reset user preferences to defaults
router.post('/reset', UserPreferencesController.resetUserPreferences);

export default router; 