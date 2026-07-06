import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
    try {
        const prompt =
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        if (chunk.text) {
                            controller.enqueue(new TextEncoder().encode(chunk.text));
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
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error: any) {
        console.error('An unexpected error occurred:', error);

        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: error.status || 500 }
        );
    }
}