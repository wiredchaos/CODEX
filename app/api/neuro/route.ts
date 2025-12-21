import OpenAI from "openai";
import { NEURO_SYSTEM_PROMPT } from "@/lib/neuro/systemPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const body = await req.json();

  const userMessage =
    body.userMessage || "Explain what I am seeing.";

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-codex",
    messages: [
      { role: "system", content: NEURO_SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  return Response.json({
    message: completion.choices[0].message.content
  });
}
