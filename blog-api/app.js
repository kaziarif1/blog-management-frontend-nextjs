import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import blogRoute from "./routes/blog.route.js";

import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Simple health check
app.get("/", (req, res) => {
    res.json({ message: "Blog API is running" });
});

app.use("/api", authRoute);
app.use("/api", userRoute);
app.use("/api", blogRoute);

// Error handling middleware (e.g., multer errors)
app.use((err, req, res, next) => {
    if (err) {
        return res.status(err.statusCode || 400).json({ message: err.message });
    }
    next();
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

export default app;
