import express from "express";

import authRoute from "../route/auth.route.js";
import userRoute from "../route/user.route.js";
import categoryRoute from "../route/product.category.route.js";
import productRoute from "../route/product.route.js";
import cartRoute from "../route/cart.route.js";
import wishlistRoute from "../route/wishlist.route.js";

const router = express.Router();

// Mounting the routes
router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/category", categoryRoute);
router.use("/product", productRoute);
router.use("/cart", cartRoute);
router.use("/wishlist", wishlistRoute);

export default router;
