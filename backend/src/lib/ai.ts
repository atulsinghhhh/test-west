import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});

export const model = async(): Promise<void>=>{
    const request = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: "user", parts: [{ text: "Hello" }] }
        ]
    })
}