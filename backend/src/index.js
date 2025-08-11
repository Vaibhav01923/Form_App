import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import formRoutes from "./routes/form.route.js";
import responseRoutes from "./routes/response.route.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

app.listen(PORT, () => {
  console.log("Server is Running on PORT 8000");
  connectDB();
});
