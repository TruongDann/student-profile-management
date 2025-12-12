import { ExtractedData } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const extractDataFromImage = async (
  base64Image: string
): Promise<ExtractedData> => {
  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as ExtractedData;
  } catch (error) {
    console.error("API Request Error:", error);
    return {};
  }
};
