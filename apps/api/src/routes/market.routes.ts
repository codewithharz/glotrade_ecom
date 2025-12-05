// src/routes/market.routes.ts
import { Router } from "express";
import { MarketController } from "../controllers/market.controller";
import { auth, requireRole } from "../middleware/auth";
import { UserService } from "../services/UserService";
import rateLimit from "express-rate-limit";

const router = Router();
const userService = new UserService();
const marketController = new MarketController();

// Rate limiting
const createListingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 listings per hour
  message: "Too many listings created, please try again later",
});

// Public routes
router.get("/products", marketController.searchProducts);
router.get("/products/featured", marketController.getFeaturedProducts);
router.get("/categories", marketController.getCategories);
router.get("/products/:id", marketController.getProductDetails);
router.get(
  "/products/:productId/price-history",
  marketController.getPriceHistory
);
router.get(
  "/products/:productId/recommendations",
  marketController.getRecommendations
);

// Protected routes
router.use(auth(userService));

// Product management
router.post("/products", createListingLimiter, marketController.createListing);
router.put("/products/:id", marketController.updateListing);
// Product reviews
router.get("/products/:productId/reviews", marketController.getProductReviews);
router.post("/products/:productId/reviews", marketController.addReview);
router.put("/products/:productId/reviews/:reviewId", marketController.updateReview);
router.delete("/products/:productId/reviews/:reviewId", marketController.deleteReview);
router.get("/reviews", marketController.getUserReviews);



// Seller routes
router.get("/seller/:sellerId/products", marketController.getSellerProducts);
router.get(
  "/products/:productId/analytics",
  marketController.getProductAnalytics
);
router.get(
  "/products/analytics/batch",
  marketController.getBatchProductAnalytics
);

// Admin only routes
router.use(requireRole(["admin"]));
router.post("/categories", marketController.createCategory);
router.put("/categories/:id", marketController.updateCategory);
router.post("/products/:id/feature", marketController.featureProduct);

export default router;
