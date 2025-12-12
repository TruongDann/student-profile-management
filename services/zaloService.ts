import { StudentProfile } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Send notification about new profile (handled by backend now)
export const sendNewProfileNotification = async (
  profile: StudentProfile
): Promise<boolean> => {
  // Backend automatically sends Zalo notification when profile is created
  // This is just a placeholder for compatibility
  console.log(
    "[Frontend] Profile saved, backend will handle Zalo notification"
  );
  return true;
};

// Send daily report via backend
export const sendDailyReport = async (
  profiles: StudentProfile[]
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/zalo/daily-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to send daily report");
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("[Zalo] Error sending daily report:", error);
    return false;
  }
};
