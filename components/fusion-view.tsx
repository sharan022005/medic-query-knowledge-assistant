"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function FusionView() {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [notes, setNotes] = React.useState("")

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) return
    const url = URL.createObjectURL(f)
    setImageUrl(url)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Image</CardTitle>
          <CardDescription>Upload an image (e.g., X-ray, CT slice) to view alongside notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" accept="image/*" onChange={onSelect} aria-label="Upload image for fusion" />
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Uploaded for analysis"
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image selected
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>Capture impressions, differential, or summary points.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type structured notes here..."
            className="min-h-60"
            aria-label="Fusion notes"
          />
          <div className="text-xs text-muted-foreground">
            Tip: Keep notes concise. Use bullet points and include key measurements or findings.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
