// src/routes/user.routes.ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { auth, requireRole } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService(); // Remove User model argument
const userController = new UserController(userService);

// Public routes
router.post("/register", userController.register);

// Protected routes
router.use(auth(userService));

router.get("/profile", userController.getAll);
router.get("/profile/:id", userController.getOne);
router.put("/profile/:id", userController.updateProfile);
router.put("/me", userController.updateMe);
router.get("/address/:address", userController.findByAddress);
router.get("/verified-sellers", userController.getVerifiedSellers);

// Current user data
router.get("/me", userController.getMe);

// Wishlist/Cart persistence
router.get("/me/storage", userController.getStorage);
router.post("/me/storage", userController.saveStorage);

// Addresses
router.get("/me/addresses", userController.listAddresses);
router.post("/me/addresses", userController.addAddress);
router.put("/me/addresses/:id", userController.updateAddress);
router.delete("/me/addresses/:id", userController.deleteAddress);
router.put("/me/addresses/:id/default", userController.setDefaultAddress);

// Account deletion
router.post("/me/delete-account", userController.requestAccountDeletion);
router.post("/me/reactivate-account", userController.reactivateAccount);
router.get("/me/deletion-status", userController.getDeletionStatus);

// Admin only routes
router.use(requireRole(["admin"]));
router.post("/verify/:id", userController.verifyUser);

export default router;
