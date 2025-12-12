import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeImage } from "./services/geminiService.js";
import * as db from "./database/db.js";
import * as zaloService from "./services/zaloService.js";
import { StudentProfile } from "./types.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" })); // Increased for base64 images

// Health check
app.get("/health", (req, res) => {
  const count = db.getProfilesCount();
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    profilesCount: count,
  });
});

// ========== GEMINI AI ==========

// Analyze image endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "base64Image is required" });
    }

    const result = await analyzeImage(base64Image);
    res.json(result);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze image",
      message: error.message,
    });
  }
});

// ========== PROFILES ==========

// Get all profiles
app.get("/api/profiles", (req, res) => {
  try {
    const profiles = db.getAllProfiles();
    res.json(profiles);
  } catch (error: any) {
    console.error("Get profiles error:", error);
    res
      .status(500)
      .json({ error: "Failed to get profiles", message: error.message });
  }
});

// Get single profile
app.get("/api/profiles/:id", (req, res) => {
  try {
    const profile = db.getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (error: any) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to get profile", message: error.message });
  }
});

// Create new profile
app.post("/api/profiles", async (req, res) => {
  try {
    const profile: StudentProfile = req.body;

    if (!profile.id || !profile.collaboratorName || !profile.studentName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.createProfile(profile);

    // Send Zalo notification
    try {
      await zaloService.sendNewProfileNotification(profile);
    } catch (zaloError) {
      console.error("Zalo notification failed:", zaloError);
      // Don't fail the request if Zalo fails
    }

    res.status(201).json({ success: true, profile });
  } catch (error: any) {
    console.error("Create profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to create profile", message: error.message });
  }
});

// Update profile status
app.patch("/api/profiles/:id/status", (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const success = db.updateProfileStatus(req.params.id, status);

    if (!success) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Update status error:", error);
    res
      .status(500)
      .json({ error: "Failed to update status", message: error.message });
  }
});

// Delete profile
app.delete("/api/profiles/:id", (req, res) => {
  try {
    const success = db.deleteProfileById(req.params.id);

    if (!success) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete profile", message: error.message });
  }
});

// Delete photo from profile
app.delete("/api/profiles/:profileId/photos/:photoId", (req, res) => {
  try {
    const { profileId, photoId } = req.params;
    const success = db.deletePhotoById(profileId, photoId);

    if (!success) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete photo error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete photo", message: error.message });
  }
});

// Clear all data
app.delete("/api/profiles", (req, res) => {
  try {
    db.clearAllProfiles();
    res.json({ success: true });
  } catch (error: any) {
    console.error("Clear all error:", error);
    res
      .status(500)
      .json({ error: "Failed to clear all data", message: error.message });
  }
});

// ========== ZALO ==========

// Send daily report
app.post("/api/zalo/daily-report", async (req, res) => {
  try {
    const profiles = db.getAllProfiles();
    const success = await zaloService.sendDailyReport(profiles);
    res.json({ success });
  } catch (error: any) {
    console.error("Daily report error:", error);
    res
      .status(500)
      .json({ error: "Failed to send daily report", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${process.env.FRONTEND_URL}`);
  console.log(`📊 Total profiles: ${db.getProfilesCount()}`);
});
