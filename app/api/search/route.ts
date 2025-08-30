import { type NextRequest, NextResponse } from "next/server"

// Mock results across cases, papers, images
const MOCK: any[] = [
  {
    id: "r1",
    type: "case",
    title: "ICU Patient with Dyspnea and RLL Opacity (MIMIC-IV)",
    snippet: "Male, 67, fever and productive cough. Imaging reveals right lower lobe opacity; elevated CRP.",
    source: "MIMIC-IV",
  },
  {
    id: "r2",
    type: "paper",
    title: "Community-Acquired Pneumonia: Diagnosis & Management",
    snippet: "This PubMed OA review highlights empiric therapy choices and risk stratification.",
    source: "PubMed Open Access",
  },
  {
    id: "r3",
    type: "image",
    title: "ChestX-ray14 Similar Pattern Match",
    snippet: "Embedding similarity indicates opacity consistent with pneumonia; verify with labs.",
    source: "NIH ChestX-ray14",
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() || ""
  const results = q
    ? MOCK.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.snippet.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q),
      )
    : []
  return NextResponse.json({ results })
}
