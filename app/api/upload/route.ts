import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const files = form.getAll("files") as File[]

  const uploaded: { url: string; name: string }[] = []
  for (const f of files) {
    // Access can be tuned. For protected PHI, use private + signed URLs.
    const { url } = await put(`medicquery/${Date.now()}-${f.name}`, f, {
      access: "public",
      addRandomSuffix: false,
    })
    uploaded.push({ url, name: f.name })
  }

  return NextResponse.json({ files: uploaded })
}
