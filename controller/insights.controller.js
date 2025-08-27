import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { Mood } from "../model/mood.model.js";

export const getSevenDaysInsights = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logs = await Mood.find({
    userId,
    date: { $gte: sevenDaysAgo },
  }).sort({ date: 1 });

  const graphData = logs.map((log) => ({
    date: log.date.toISOString().split("T")[0],
    mood: log.mood,
  }));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "7-day insights fetched successfully",
    data: graphData,
  });
});

// Get monthly insights (mood counts and satisfaction days chart)
export const getMonthlyInsights = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  oneMonthAgo.setHours(0, 0, 0, 0);

  const moodLogs = await Mood.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneMonthAgo },
      },
    },
    { $group: { _id: "$mood", count: { $sum: 1 } } },
  ]);

  const moodCounts = moodLogs.reduce(
    (acc, item) => ({ ...acc, [item._id]: item.count }),
    {}
  );

  const satisfactionLogs = await Mood.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneMonthAgo },
      },
    },
    { $group: { _id: "$satisfaction", count: { $sum: 1 } } },
  ]);

  const satisfactionCounts = satisfactionLogs.reduce(
    (acc, item) => ({ ...acc, [item._id]: `${item.count} days` }),
    {}
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly insights fetched successfully",
    data: { moodCounts, satisfactionCounts },
  });
});
