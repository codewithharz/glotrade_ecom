import { Router } from "express";
import orderController from "../controllers/order.controller";
import { auth } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();

// Create (Public for guest checkout)
router.post("/", orderController.create);

// Auth for create and reads
const userService = new UserService();
router.use(auth(userService));
// List
router.get("/", orderController.list);
// Analytics (place BEFORE dynamic :orderId routes to avoid matching 'analytics' as an id)
router.get("/analytics/overview", orderController.analytics);
// Resolve short id to full id
router.get("/resolve/:key", orderController.resolve);
// Detail
router.get("/:orderId", orderController.getOne);
// Status update
router.patch("/:orderId/status", orderController.updateStatus);

// Invoice
router.post("/:id/invoice", orderController.generateInvoice);
router.get("/:id/invoice/download", orderController.downloadInvoice);

export default router;

// // src/routes/order.routes.ts
// import { Router } from "express";
// import { OrderController } from "../controllers/order.controller";
// import { auth, requireRole } from "../middleware/auth";
// import { UserService } from "../services/UserService";
// import rateLimit from "express-rate-limit";

// const router = Router();
// const userService = new UserService();
// const orderController = new OrderController();

// // Rate limiting
// const orderCreateLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 20, // 20 orders per hour
//   message: "Too many orders created, please try again later",
// });

// // All order routes require authentication
// router.use(auth(userService));

// // Order management
// router.post("/", orderCreateLimiter, orderController.createOrder);
// router.get("/", orderController.getOrderHistory);
// router.get("/:orderId", orderController.getOrderDetails);

// // Payment processing
// router.post("/:orderId/payment", orderController.processPayment);

// // Order status
// router.patch("/:orderId/status", orderController.updateOrderStatus);
// router.patch("/:orderId/shipping", orderController.updateShippingStatus);

// // Disputes
// router.post("/:orderId/dispute", orderController.createDispute);
// router.get("/:orderId/dispute", orderController.getDisputeDetails);

// // Analytics
// router.get("/analytics/overview", orderController.getOrderAnalytics);

// // Admin only routes
// router.use(requireRole(["admin"]));
// router.get("/admin/all", orderController.getAllOrders);
// router.post("/:orderId/refund", orderController.processRefund);
// router.put("/:orderId/dispute/resolve", orderController.resolveDispute);

// export default router;
