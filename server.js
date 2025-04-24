const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const leadRoutes = require("./routes/leads");

dotenv.config();
const app = express();

app.use(
    cors({
        origin: "https://leadsboard-fe.vercel.app",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
// DB connect
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
        });
    })
    .catch((err) => console.error("MongoDB connection error:", err));
