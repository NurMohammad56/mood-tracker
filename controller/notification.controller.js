import httpStatus from "http-status";
import { User } from "../model/user.model.js";
import admin from "firebase-admin";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";

// Update device token for push notifications
export const updateDeviceToken = catchAsync(async (req, res) => {
  const { deviceToken } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.deviceToken = deviceToken;
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Device token updated successfully",
    data: null,
  });
});

// Update last active timestamp
export const updateLastActive = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.lastActive = new Date();
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Last active updated successfully",
    data: null,
  });
});

// Send push notification reminders
export const sendReminders = async () => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const inactiveUsers = await User.find({
    lastActive: { $lt: sixHoursAgo },
    deviceToken: { $exists: true, $ne: null },
  });

  for (const user of inactiveUsers) {
    const message = {
      notification: {
        title: "Mood Tracker Reminder",
        body: "Hey, open the app and log your mood today!",
      },
      token: user.deviceToken,
    };

    try {
      await admin.messaging().send(message);
      console.log(`Notification sent to user ${user._id}`);
    } catch (error) {
      console.error(`Error sending to user ${user._id}:`, error);
    }
  }
};
