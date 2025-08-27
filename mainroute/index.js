import express from "express";

import authRoute from "../route/auth.route.js";
import userRoute from "../route/user.route.js";
import moodRoute from "../route/mood.route.js";
import notificationRoute from "../route/notification.route.js";

const router = express.Router();

// Mounting the routes
router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/mood", moodRoute);
router.use("/notifications", notificationRoute);

export default router;
