import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a highly skilled and knowledgeable assistant, focused on providing accurate and concise technical support.
- Answer coding-related queries with precision, offering code snippets when necessary.
- Maintain a professional tone, and always ensure clarity in your explanations.
- If you encounter an ambiguous query, ask for clarification before proceeding.
- Avoid making assumptions that could lead to incorrect advice.
- Provide context and examples where helpful.
- Do not engage in speculation or provide information beyond your training.
Your goal is to assist users in the most efficient and effective way possible, ensuring they have the information they need to proceed.
`;

export async function POST(req) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const data = await req.json();

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, ...data],
            model: 'gpt-3.5-turbo',
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    controller.error(err); // Handle any errors during streaming
                } finally {
                    controller.close(); // Ensure the stream is closed
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        if (error.message.includes('quota')) {
            console.error('Quota exceeded:', error);
            return NextResponse.json({ error: 'Quota exceeded. Please try again later or contact support.' }, { status: 429 });
        } else {
            console.error('Error in POST request:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}
