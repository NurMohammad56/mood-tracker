import { express } from "express";

import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
} from "../controller/notification.controller.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getNotifications);
router.patch("/:notificationId", markNotificationAsRead);

export default router;
