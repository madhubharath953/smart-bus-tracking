import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const FLEET_KNOWLEDGE_BASE = {
    buses: [
        {
            id: "bus-402",
            registration: "TN-69-HH-1234",
            driver: "Ram Singh",
            route: "Tuticorin - Sawyerpuram Express",
            origin: "Thoothukudi (Old Bus Stand)",
            destination: "Sawyerpuram Junction"
        },
        {
            id: "bus-405",
            registration: "TN-69-HH-4567",
            driver: "Selvam Kumar",
            route: "Tiruchendur - Sawyerpuram Link",
            origin: "Tiruchendur (Murugan Temple)",
            destination: "Sawyerpuram Junction"
        },
        {
            id: "bus-408",
            registration: "TN-69-HH-8888",
            driver: "Muthu Raj",
            route: "Tirunelveli - Sawyerpuram Express",
            origin: "Palayamkottai",
            destination: "Sawyerpuram Junction"
        }
    ],
    depots: [
        { name: "Thoothukudi Central Depot", location: "Near Old Bus Stand" },
        { name: "Tiruchendur Terminal", location: "Near Murugan Temple" },
        { name: "Palayamkottai Terminal", location: "Tirunelveli Area" },
        { name: "Sawyerpuram Junction", location: "Primary Destination" }
    ],
    system: {
        name: "Transit AI",
        organization: "Thoothukudi College Transit",
        purpose: "Real-time bus tracking and student transit assistance.",
        persona: "Supportive Campus Mentor",
        campus: {
            landmarks: [
                { name: "Main Library", location: "North Campus, near Bus Stop 1" },
                { name: "Exam Hall A/B", location: "Central Block, 2nd Floor" },
                { name: "Main Canteen", location: "West Wing, opposite Science Lab" },
                { name: "Student Union Office", location: "Ground Floor, Admin Block" }
            ],
            faqs: [
                { q: "What if I lose my ID?", a: "Visit the Student Union Office or ask the driver; items are often handed in there." },
                { q: "When are the exam specials?", a: "Special buses run 1 hour before first-period exams. Check the dashboard for 'Exam Express' labels." },
                { q: "Can I track my specific stop?", a: "Yes, use the live map to see the bus approaching your saved location." }
            ]
        }
    }
};

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
        const staticInfo = `Fleet Info: ${FLEET_KNOWLEDGE_BASE.buses.map(b => `${b.id.toUpperCase()} (Driver: ${b.driver})`).join(', ')}.`;
        const fallbackReply = `I'm Transit AI. ${fleetSummary} ${staticInfo} For precise arrival times, please check the dashboard map.`;

        if (!apiKey) {
            console.log("Chat API: No API key, using smart fallback");
            return NextResponse.json({ reply: fallbackReply });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const fleetContext = typedBuses.length > 0
            ? `Real-time Fleet Status: ${typedBuses.map((bus) => `Bus ${bus.id.toUpperCase()} (${bus.stats?.registration || 'N/A'}): ${bus.isSimulating ? 'Moving at ' + (bus.stats?.speed || 0) + 'km/h' : 'Stationary'}. Next: ${bus.stats?.nextStop || 'TBD'}. ETA: ${bus.stats?.eta || 'N/A'}.`).join('\n')}`
            : "No live bus data available currently.";

        const knowledgeBaseContext = `Static Knowledge Base:
        Buses: ${JSON.stringify(FLEET_KNOWLEDGE_BASE.buses)}
        Depots: ${JSON.stringify(FLEET_KNOWLEDGE_BASE.depots)}
        Campus: ${JSON.stringify(FLEET_KNOWLEDGE_BASE.system.campus)}`;

        const prompt = `Assistant: ${FLEET_KNOWLEDGE_BASE.system.name} (${FLEET_KNOWLEDGE_BASE.system.organization}).
        Persona: ${FLEET_KNOWLEDGE_BASE.system.persona}
        System Purpose: ${FLEET_KNOWLEDGE_BASE.system.purpose}
        
        Knowledge Base: ${knowledgeBaseContext}
        
        Live Context: ${fleetContext}
        
        User Query: "${message}"
        
        Guidelines:
        - Reply like a helpful "Senior Student" or "Campus Mentor".
        - Be concise (1-2 sentences).
        - Use the Knowledge Base for driver info, campus landmarks, and student FAQs.
        - Use the Live Context for current speeds, locations, and ETAs.
        - If the student seems stressed about missing a bus, be encouraging but realistic based on the ETA.
        - If they ask about landmarks like the Library or Exam Hall, guide them based on the Campus info.
        - Be professional, helpful, and friendly.`;

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
