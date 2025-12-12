import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ExtractedData {
  studentName?: string;
  studentPhone?: string;
}

export const analyzeImage = async (
  base64Image: string
): Promise<ExtractedData> => {
  // Remove data URL prefix if present
  const cleanBase64 = base64Image.replace(
    /^data:image\/(png|jpeg|jpg|webp);base64,/,
    ""
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this document image. Extract the Student Name (Họ và tên) and Phone Number (Số điện thoại). If not found, return empty string. Return in JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            studentPhone: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedData;
    }
    return {};
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
