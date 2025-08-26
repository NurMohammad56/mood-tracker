import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    mood: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    thoughts: { type: String },
    satisfaction: {
      type: String,
      enum: ["Very good", "Good", "Not so good", "Not good at all"],
    },
    waterGlasses: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

moodSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Mood = mongoose.model("Mood", moodSchema);
