import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                reply: "AI is currently offline (API key missing). How else can I help you with the bus schedule?"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a helpful assistant for a College Bus Tracking System. 
        A student is asking: "${message}"
        Provide a concise and helpful response. If it's about bus timing, mention that you are an AI and they can also check the live map.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ reply: text });

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: "Failed to fetch response from AI" }, { status: 500 });
    }
}
