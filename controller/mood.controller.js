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
          content: `Generate a unique motivational message for someone feeling ${mood}. Make it positive and encouraging. Keep it under 20 words.`,
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

  if (!mood) {
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

  const log = await Mood.create({ userId, date: today, mood, thoughts });

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

  if (
    !["Very good", "Good", "Not so good", "Not good at all"].includes(
      satisfaction
    )
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid satisfaction level");
  }

  const mood = await Mood.findOne({ _id: logId, userId });
  if (!mood) {
    throw new AppError(httpStatus.NOT_FOUND, "Mood not found");
  }

  if (mood.satisfaction) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Satisfaction already submitted"
    );
  }

  mood.satisfaction = satisfaction;
  await mood.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Satisfaction submitted successfully",
    data: mood,
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

// Get all moods for a user
export const getAllMoods = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const moods = await Mood.find({ userId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All moods fetched successfully",
    data: moods,
  });
});

// Get mood details (by ID instead of date)
export const getMoodDetails = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { moodId } = req.params;

  if (!moodId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Mood ID is required");
  }

  const log = await Mood.findOne({ _id: moodId, userId });

  if (!log) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No mood log found with the specified ID"
    );
  }

  const motivation = await generateMotivation(log.mood);
  const enhancedLog = { ...log.toObject(), motivation };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Mood details fetched successfully by ID",
    data: enhancedLog,
  });
});
