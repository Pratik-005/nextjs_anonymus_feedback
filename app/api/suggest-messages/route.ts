import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST() {
    try {
        const prompt =
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform.";

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(chunk.text));
                        }
                    }

                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: any) {
        console.error(error);

        let message = "Internal Server Error";
        let status = 500;

        if (error.status === 429) {
            status = 429;
            message =
                "Gemini API quota exceeded. Please try again later or check your billing/quota.";
        } else if (error.status === 401) {
            status = 401;
            message = "Invalid Gemini API key.";
        } else if (error.status === 404) {
            status = 404;
            message = "The requested Gemini model is unavailable.";
        } else if (error.message) {
            message = error.message;
        }

        return NextResponse.json(
            {
                success: false,
                message,
            },
            { status }
        );
    }
}