const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Emergency Response API is running",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/accidents", require("./routes/accidentRoutes"));
app.use("/api/ambulances", require("./routes/ambulanceRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/casualties", require("./routes/casualtyRoutes"));
app.use("/api/blood", require("./routes/bloodRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
