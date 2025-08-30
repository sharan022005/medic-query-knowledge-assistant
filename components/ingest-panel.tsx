"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type LocalFile = {
  id: string
  file: File
  url?: string
}

export function IngestPanel() {
  const [files, setFiles] = React.useState<LocalFile[]>([])

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const withIds: LocalFile[] = selected.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}-${crypto.randomUUID()}`,
      file: f,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }))
    setFiles((prev) => [...prev, ...withIds])
  }

  function clearAll() {
    setFiles((prev) => {
      prev.forEach((f) => f.url && URL.revokeObjectURL(f.url))
      return []
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add files</CardTitle>
          <CardDescription>Upload PDFs, images, or text files for local analysis.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input type="file" multiple onChange={onSelect} aria-label="Select files to ingest" />
            <Button variant="secondary" onClick={clearAll}>
              Clear
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Files are stored in memory only for this session. No uploads or external storage required.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {files.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No files yet</CardTitle>
              <CardDescription>Select files to see them listed here.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          files.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium break-words">{f.file.name}</CardTitle>
                <CardDescription className="text-xs">
                  {(f.file.size / 1024).toFixed(1)} KB • {f.file.type || "unknown"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {f.url ? (
                  <img
                    src={f.url || "/placeholder.svg"}
                    alt={`Preview of ${f.file.name}`}
                    className="h-40 w-full rounded-md object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Badge variant="outline">No preview</Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
