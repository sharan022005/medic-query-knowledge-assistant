"use client"

import type React from "react"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type SearchResult = {
  id: string
  type: "case" | "paper" | "image"
  title: string
  snippet: string
  source: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Page() {
  // Simple palette adherence:
  // Colors used (4 total): primary blue (#2563eb via Tailwind blue-600), neutral white, neutral gray (slate), accent teal (teal-600 used sparingly).
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<{ url: string; name: string }[]>([])
  const [query, setQuery] = useState("")
  const [summaryInput, setSummaryInput] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryText, setSummaryText] = useState("")

  const {
    data: searchData,
    isLoading: searchLoading,
    mutate,
  } = useSWR<{ results: SearchResult[] }>(query ? `/api/search?q=${encodeURIComponent(query)}` : null, fetcher)

  // Simple image annotator state
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<{ x: number; y: number }[]>([])

  async function handleUpload() {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((f) => formData.append("files", f))
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setUploaded((prev) => [...data.files, ...prev])
      setFiles(null)
    } catch (err) {
      console.error("[v0] Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSummarize() {
    if (!summaryInput.trim()) return
    setSummaryLoading(true)
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryInput }),
      })
      const data = await res.json()
      setSummaryText(data.summary || "")
    } catch (e) {
      console.error("[v0] summarize error:", e)
    } finally {
      setSummaryLoading(false)
    }
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setAnnotations((prev) => [...prev, { x, y }])
  }

  const recentUploadsImages = useMemo(
    () => uploaded.filter((u) => u.name.match(/\.(png|jpg|jpeg|gif|webp)$/i)),
    [uploaded],
  )

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">MedicQuery</h1>
          <div className="text-sm text-slate-600">BigQuery AI-powered multimodal assistant (MVP)</div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="ingest" className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-slate-50">
            <TabsTrigger value="ingest">Ingest</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="fusion">Fusion View</TabsTrigger>
          </TabsList>

          <TabsContent value="ingest" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-pretty">Upload PDFs, Notes, and Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="cursor-pointer" />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleUpload} disabled={uploading || !files?.length}>
                      {uploading ? "Uploading..." : "Upload to Blob"}
                    </Button>
                    <span className="text-sm text-slate-600">
                      Files stored via Blob (swap to BigQuery Object Tables later).
                    </span>
                  </div>
                  {!!uploaded.length && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recent uploads</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {uploaded.slice(0, 5).map((f, i) => (
                          <li key={i}>
                            <a className="text-blue-600 hover:underline" href={f.url} target="_blank" rel="noreferrer">
                              {f.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-pretty">Structured EHR Connector (Placeholder)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-600">
                    Connect age, demographics, vitals, labs. In production, link to BigQuery tables.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Patient ID" />
                    <Input placeholder="Encounter ID" />
                    <Input placeholder="Age" />
                    <Input placeholder="Heart Rate" />
                  </div>
                  <Button variant="secondary">Save EHR Context (Mock)</Button>
                  <div className="text-xs text-slate-500">
                    Note: This MVP stores UI state only. Replace with BigQuery table writes.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-pretty">Knowledge Retrieval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g., dyspnea with hazy right lower lobe — similar cases, PubMed, images..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button onClick={() => mutate()} disabled={!query.length} className="bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </div>
                <div>
                  {searchLoading && <div className="text-sm text-slate-600">Searching…</div>}
                  {searchData?.results?.length ? (
                    <ul className="space-y-3">
                      {searchData.results.map((r) => (
                        <li key={r.id} className="rounded-md border border-slate-200 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{r.title}</div>
                            <span
                              className={cn(
                                "text-xs rounded px-2 py-0.5",
                                r.type === "paper"
                                  ? "bg-teal-50 text-teal-700"
                                  : r.type === "image"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-slate-100 text-slate-700",
                              )}
                            >
                              {r.type}
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 mt-1">{r.snippet}</div>
                          <div className="text-xs text-slate-500 mt-1">{r.source}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-slate-600">
                      Enter a query to retrieve similar cases, PubMed papers, or images.
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  Placeholder uses API stub. Replace with BigQuery VECTOR_SEARCH across text and images.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summarize" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-pretty">AI Summarization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste clinical report, research abstract, or note to summarize…"
                  rows={8}
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleSummarize} disabled={summaryLoading || !summaryInput.trim()}>
                    {summaryLoading ? "Summarizing…" : "Generate Summary"}
                  </Button>
                  <span className="text-sm text-slate-600">
                    Backed by AI SDK (Grok). Swap to BigQuery AI.GENERATE_TEXT later.
                  </span>
                </div>
                {!!summaryText && (
                  <div className="rounded-md border border-slate-200 p-4 bg-slate-50">
                    <div className="text-sm font-medium mb-1">Summary</div>
                    <div className="text-sm leading-relaxed">{summaryText}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fusion" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-pretty">Images (X-ray, CT)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentUploadsImages.length === 0 ? (
                    <div className="text-sm text-slate-600">
                      Upload images in the Ingest tab. Select to annotate here.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {recentUploadsImages.map((img, i) => (
                        <li key={i}>
                          <button
                            className="text-blue-600 hover:underline text-left"
                            onClick={() => {
                              setSelectedImageUrl(img.url)
                              setAnnotations([])
                            }}
                          >
                            {img.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedImageUrl && (
                    <div>
                      <div className="text-sm font-medium mb-2">Selected Image</div>
                      <div
                        className="relative border border-slate-200 rounded-md overflow-hidden"
                        onClick={handleCanvasClick}
                        role="img"
                        aria-label="X-ray image with annotation layer"
                      >
                        {/* Use placeholder if CORS blocked; images should be direct Blob URLs */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedImageUrl || "/placeholder.svg"}
                          alt="Selected medical image"
                          className="w-full max-h-[360px] object-contain bg-slate-50"
                        />
                        {/* Simple annotation dots */}
                        <div className="absolute inset-0 pointer-events-none">
                          {annotations.map((a, idx) => (
                            <span
                              key={idx}
                              className="absolute w-3 h-3 rounded-full bg-teal-600"
                              style={{ left: a.x - 6, top: a.y - 6 }}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Click on the image to drop markers. Replace with robust annotation later.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-pretty">Integrated View</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-700">
                    Unified context combining EHR attributes, summarized PDFs, and annotated images.
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-md border border-slate-200 p-3">
                      <div className="text-xs font-medium text-slate-500 mb-1">AI Findings (Mock)</div>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Salient pattern: Right lower lobe opacity consistent with pneumonia.</li>
                        <li>Recommendation: Consider empiric antibiotics; correlate with WBC and CRP.</li>
                        <li>Related study: PubMed 31234567 – Outcomes in community-acquired pneumonia.</li>
                      </ul>
                    </div>
                    <div className="rounded-md border border-slate-200 p-3">
                      <div className="text-xs font-medium text-slate-500 mb-1">References</div>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>MIMIC-IV case cohort with similar vitals and radiology notes (placeholder)</li>
                        <li>NIH ChestX-ray14 — matched pattern embeddings (placeholder)</li>
                        <li>PubMed OA summaries from Summarize tab</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Replace mocks with live joins to BigQuery VECTOR_SEARCH + Object Tables.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          Datasets: MIMIC-IV, PubMed OA, NIH ChestX-ray14, synthetic hackathon data (for POC).
        </div>
      </footer>
    </main>
  )
}
