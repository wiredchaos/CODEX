import OpenAI from "openai"
import { NEURO_SYSTEM_PROMPT } from "@/lib/neuro/systemPrompt"

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function POST(req: Request) {
  const client = getOpenAIClient()
  if (!client) {
    return Response.json(
      {
        error:
          "OPENAI_API_KEY is not configured on the server. Telemetry and 3D worlds can run without it; neuro requires it at runtime.",
      },
      { status: 500 },
    )
  }

  const body = await req.json()

  const userMessage =
    body.userMessage || "Explain what I am seeing."

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-codex",
    messages: [
      { role: "system", content: NEURO_SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  })

  return Response.json({
    message: completion.choices[0].message.content
  })
}
