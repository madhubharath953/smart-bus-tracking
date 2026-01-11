import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        console.log("Chat API: Received message:", message);

        // Fetch ALL Real-time Bus Data
        console.log("Chat API: Fetching buses...");
        const busesCol = collection(db, "buses");
        const busSnapshot = await getDocs(busesCol);
        // We'll keep one any here to avoid importing types from context which is a client file
        // but let's use a local interface for safety
        interface ChatBus {
            id: string;
            isSimulating: boolean;
            stats?: {
                nextStop?: string;
                registration?: string;
                speed?: number;
                eta?: string;
            };
        }
        const typedBuses = busSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatBus[];
        console.log("Chat API: Found buses:", typedBuses.length);

        const movingBuses = typedBuses.filter((b) => b.isSimulating);
        const fleetSummary = movingBuses.length > 0
            ? `${movingBuses.length} buses are currently moving. ${movingBuses.map((b) => `${b.id.toUpperCase()} is near ${b.stats?.nextStop || 'the harbor'}`).join(', ')}.`
            : "All buses are currently at the depot or stationary.";

        // Fallback response if Gemini is unavailable
        const fallbackReply = `I'm Transit AI (Live Data Mode). ${fleetSummary} For precise arrival times, please check the dashboard map.`;

        if (!apiKey) {
            console.log("Chat API: No API key, using smart fallback");
            return NextResponse.json({ reply: fallbackReply });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const fleetContext = typedBuses.length > 0
            ? `Fleet Status: ${typedBuses.map((bus) => `Bus ${bus.id.toUpperCase()} (${bus.stats?.registration || 'N/A'}): ${bus.isSimulating ? 'Moving at ' + (bus.stats?.speed || 0) + 'km/h' : 'Stationary'}. Next: ${bus.stats?.nextStop || 'TBD'}. ETA: ${bus.stats?.eta || 'N/A'}.`).join('\n')}`
            : "No bus data available.";

        const prompt = `Assistant: Transit AI (Thoothukudi College Transit).
        Context: ${fleetContext}
        User Query: "${message}"
        Reply concisely (1-2 sentences). Be specific if they ask about a bus ID. If all stationary, recommend checking back later.`;

        try {
            console.log("Chat API: Generating AI response...");
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log("Chat API: AI Response Success");
            return NextResponse.json({ reply: text });
        } catch (aiError) {
            console.error("Gemini call failed, using fallback:", aiError);
            return NextResponse.json({ reply: fallbackReply });
        }
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Undefined Error";
        console.error("Chat API Critical Error:", errorMsg);
        return NextResponse.json({ error: "System Error", details: errorMsg }, { status: 500 });
    }
}
