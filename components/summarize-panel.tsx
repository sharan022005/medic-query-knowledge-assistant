"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type SummaryResponse = {
  summary: string
  bullets: string[]
}

export function SummarizePanel() {
  const [text, setText] = React.useState("")
  const [result, setResult] = React.useState<SummaryResponse | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSummarize(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error("Failed to summarize")
      const data: SummaryResponse = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSummarize} className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paste clinical text</CardTitle>
            <CardDescription>Content is processed locally via a stubbed API (no external services).</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste SOAP note, imaging report, or reference excerpt..."
              className="min-h-40"
              aria-label="Text to summarize"
            />
            <div className="mt-3 flex items-center gap-2">
              <Button type="submit" disabled={!text.trim() || loading}>
                {loading ? "Summarizing…" : "Summarize"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm leading-relaxed">{result.summary}</p>
            <ul className="list-disc pl-5 text-sm">
              {result.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
