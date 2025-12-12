import { StudentProfile, Photo } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper to resize image before sending to save bandwidth
const resizeImage = (base64Str: string, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = maxWidth / img.width;
      const width = maxWidth;
      const height = img.height * ratio;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const getProfiles = async (): Promise<StudentProfile[]> => {
  try {
    const response = await fetch(`${API_URL}/api/profiles`);
    if (!response.ok) throw new Error("Failed to fetch profiles");
    return await response.json();
  } catch (e) {
    console.error("Error loading profiles", e);
    return [];
  }
};

export const saveProfile = async (profile: StudentProfile): Promise<void> => {
  try {
    // Resize photos before sending
    const resizedPhotos = await Promise.all(
      profile.photos.map(async (p) => ({
        ...p,
        data: await resizeImage(p.data),
      }))
    );

    const profileToSave = { ...profile, photos: resizedPhotos };

    const response = await fetch(`${API_URL}/api/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileToSave),
    });

    if (!response.ok) {
      throw new Error("Failed to save profile");
    }
  } catch (e) {
    console.error("Error saving profile", e);
    throw e;
  }
};

export const deletePhoto = async (
  profileId: string,
  photoId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_URL}/api/profiles/${profileId}/photos/${photoId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete photo");
    }
  } catch (e) {
    console.error("Error deleting photo", e);
    throw e;
  }
};

export const deleteProfile = async (profileId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/profiles/${profileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete profile");
    }
  } catch (e) {
    console.error("Error deleting profile", e);
    throw e;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/profiles`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to clear all data");
    }
  } catch (e) {
    console.error("Error clearing data", e);
    throw e;
  }
};
