import { Router } from "express";
import sellerController from "../controllers/seller.controller";
import { auth } from "../middleware/auth";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService();

router.get("/:slug", sellerController.getBySlug);
router.get("/:slug/products", sellerController.productsBySlug);
router.get("/:slug/search", sellerController.searchBySlug);

router.use(auth(userService));
router.get("/me/profile", sellerController.me);
router.put("/me/profile", sellerController.upsert);
router.post("/:slug/follow", sellerController.follow);
router.post("/:slug/unfollow", sellerController.unfollow);

export default router;

