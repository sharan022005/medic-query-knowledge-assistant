import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 })
  }

  const prompt = `
You are a medical assistant. Summarize the following clinical or research text into 4-6 bullet points.
Emphasize: key diagnoses, differential, treatment options, risks, and any pertinent evidence.

Text:
${text}
`

  try {
    const { text: summary } = await generateText({
      model: xai("grok-4"),
      prompt,
    })
    return NextResponse.json({ summary })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "AI error" }, { status: 500 })
  }
}
