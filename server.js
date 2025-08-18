import express from "express";
import dotenv from "dotenv";
import dbconnect from "./dbConnect/db.config.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello esterjaku123!",
  });
});

app.listen(PORT, async () => {
  await dbconnect();
  console.log(`Server is running at http://localhost:${PORT}`);
});
