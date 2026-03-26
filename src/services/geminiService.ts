import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generatePoliceReport = async (incidentDescription: string) => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    You are Sahaya AI Assistant, specialized in police reporting.
    Your goal is to help users prepare a CCTNS-compatible complaint.
    CCTNS (Crime and Criminal Tracking Network & Systems) requires specific details:
    - Type of Incident
    - Date and Time
    - Location
    - Detailed Description
    - Suspect details (if any)
    - Property stolen/damaged (if any)
    
    If the user provides a description in any language (English, Hindi, Telugu, etc.), translate it to English and structure it.
    If details are missing, ask the user politely in their language.
    
    Response format:
    Always provide a structured summary in English, but you can converse in the user's language.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: incidentDescription,
    config: {
      systemInstruction,
    },
  });

  return response.text;
};

export const chatWithAssistant = async (messages: { role: 'user' | 'model', text: string }[]) => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    You are Sahaya AI Assistant. You help users report crimes and provide guidance.
    You support English, Hindi, and Telugu.
    Be empathetic, professional, and clear.
    If a user is in immediate danger, tell them to use the SOS button or call 100.
  `;

  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
    },
  });

  return response.text;
};
