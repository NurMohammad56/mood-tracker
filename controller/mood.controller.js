import httpStatus from "http-status";
import { OpenAI } from "openai";
import { Mood } from "../model/mood.model.js";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateMotivation = async (mood) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Generate a unique motivational message for someone feeling ${mood}. Make it positive and encouraging. Keep it under 30 words.`,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate motivational message"
    );
  }
};

// Submit mood and thoughts
export const submitMood = catchAsync(async (req, res) => {
  const { mood, thoughts } = req.body;
  const userId = req.user._id;

  if (
    !mood ||
    ![
      "happy",
      "relaxed",
      "emotional",
      "anxious",
      "confused",
      "frustrated",
      "silly",
      "curious",
      "adventurous",
      "romantic",
      "excited",
      "weird",
      "hopeful",
      "sleepy",
      "stressed",
    ].includes(mood)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or missing mood");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await Mood.findOne({ userId, date: { $gte: today } });
  if (existingLog) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Mood already submitted for today"
    );
  }

  const log = await DailyLog.create({ userId, date: today, mood, thoughts });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Mood submitted successfully, now submit satisfaction",
    data: log,
  });
});

// Submit satisfaction
export const submitSatisfaction = catchAsync(async (req, res) => {
  const { satisfaction } = req.body;
  const userId = req.user._id;
  const logId = req.params.id;

  if (!["so good", "very good", "good", "not good"].includes(satisfaction)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid satisfaction level");
  }

  const log = await Mood.findOne({ _id: logId, userId });
  if (!log) {
    throw new AppError(httpStatus.NOT_FOUND, "Log not found");
  }
  if (log.satisfaction) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Satisfaction already submitted"
    );
  }

  log.satisfaction = satisfaction;
  await log.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Satisfaction submitted successfully",
    data: log,
  });
});

// Get weekly logs (structured for 7 days: Today, Yesterday, etc.)
export const getWeeklyLogs = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logs = await Mood.find({
    userId,
    date: { $gte: sevenDaysAgo },
  }).sort({ date: -1 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const structuredLogs = logs.map((log, index) => {
    const logDate = new Date(log.date);
    let dayLabel;
    if (logDate.toDateString() === today.toDateString()) {
      dayLabel = "Today";
    } else if (logDate.getDate() === today.getDate() - 1) {
      dayLabel = "Yesterday";
    } else {
      dayLabel = logDate.toLocaleDateString("en-US", { weekday: "long" });
    }
    return {
      day: dayLabel,
      date: log.date.toISOString().split("T")[0],
      mood: log.mood,
    };
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Weekly logs fetched successfully",
    data: structuredLogs,
  });
});

// Update water and sleep trackers
export const updateTracker = catchAsync(async (req, res) => {
  const { waterGlasses, sleepHours } = req.body;
  const userId = req.user._id;
  const logId = req.params.id;

  const log = await Mood.findOne({ _id: logId, userId });
  if (!log) {
    throw new AppError(httpStatus.NOT_FOUND, "Log not found");
  }

  if (waterGlasses !== undefined) log.waterGlasses = waterGlasses;
  if (sleepHours !== undefined) log.sleepHours = sleepHours;

  await log.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Trackers updated successfully",
    data: log,
  });
});

// Get mood details (specific day with full details)
export const getMoodDetails = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { date } = req.query;

  if (!date) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Date query parameter is required"
    );
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  const log = await Mood.findOne({
    userId,
    date: { $gte: targetDate, $lt: nextDay },
  });

  if (!log) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No mood log found for the specified date"
    );
  }

  const motivation = await generateMotivation(log.mood);
  const enhancedLog = { ...log.toObject(), motivation };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Mood details for specific day fetched successfully",
    data: enhancedLog,
  });
});
