import express from 'express';
import {
    createBanner,
    getBanners,
    getBanner,
    updateBanner,
    deleteBanner,
} from '../controllers/banner.controller';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { UserService } from '../services/UserService';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const userService = new UserService();

// Public routes
router.get('/', getBanners);

// Admin routes
router.use(auth(userService));
router.use(adminAuth);

router.post('/', upload.single('image'), createBanner);
router.get('/:id', getBanner);
router.put('/:id', upload.single('image'), updateBanner);
router.delete('/:id', deleteBanner);

export default router;
