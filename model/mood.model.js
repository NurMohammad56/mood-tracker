import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    mood: {
        type: String,
        required: true,
        enum: ["happy", "relaxed", "emotional", "anxious", "confused", "frustrated", "silly", "curious", "adventurous", "romantic", "excited", "weird", "hopeful", "sleepy", "stressed"],
    }, 
    description: {
        type: String,
    },
    waterIntake: {
        type: Number,
    },
    sleepHours: {
        type: Number,
    }
}, { timestamps: true, }
);

const Mood = mongoose.model("Mood", moodSchema);

export default Mood;