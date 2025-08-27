import express from "express";
import {
  submitMood,
  submitSatisfaction,
  getWeeklyLogs,
  updateTracker,
  getMoodDetails,
} from "../controller/mood.controller.js";
import {
  getSevenDaysInsights,
  getMonthlyInsights,
} from "../controller/insights.controller.js";
import { updateDeviceToken } from "../controller/notification.controller.js";
import { updateActiveMiddleware } from "../middleware/updateActive.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth and auto-update lastActive to all routes
router.use(protect, updateActiveMiddleware);

// Mood submission
router.post("/log", submitMood);
router.patch("/log/:id", submitSatisfaction);

// Weekly logs
router.get("/weekly", getWeeklyLogs);

// Update trackers
router.patch("/log/:id/tracker", updateTracker);

// Mood details
router.get("/details", getMoodDetails);

// Insights
router.get("/insights/7days", getSevenDaysInsights);
router.get("/insights/monthly", getMonthlyInsights);

// Notifications
router.post("/device-token", updateDeviceToken);

export default router;
