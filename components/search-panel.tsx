"use client"

import * as React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type SearchResult = {
  id: string
  title: string
  snippet: string
  source?: string
}

export function SearchPanel() {
  const [term, setTerm] = React.useState("")
  const [query, setQuery] = React.useState<string | null>(null)

  const { data, isLoading } = useSWR<{ results: SearchResult[] }>(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setQuery(term.trim() || null)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search clinical notes, imaging summaries, and references"
          aria-label="Search"
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Searching…</p>}

      {!isLoading && data?.results?.length === 0 && query && (
        <p className="text-sm text-muted-foreground">No results for “{query}”.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.results?.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{r.title}</CardTitle>
              {r.source && <CardDescription className="text-xs">Source: {r.source}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{r.snippet}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">Relevance</Badge>
                <Badge variant="outline">Mock</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
