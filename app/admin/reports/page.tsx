"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getAllReports, updateReportStatus } from "@/lib/supabase/queries"
import type { Report } from "@/lib/types/database"
import { Flag, RefreshCw } from "lucide-react"

type ReportRow = Awaited<ReturnType<typeof getAllReports>>[number]

const statusVariant: Record<Report["status"], "default" | "secondary" | "outline" | "destructive"> = {
  open: "destructive",
  reviewing: "default",
  resolved: "secondary",
  dismissed: "outline",
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  async function loadReports() {
    setLoading(true)
    setReports(await getAllReports())
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [])

  async function updateStatus(report: ReportRow, status: Report["status"]) {
    await updateReportStatus(report.id, status, notes[report.id] || report.admin_notes || undefined)
    await loadReports()
  }

  return (
    <DashboardLayout>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-muted-foreground">Review listing and artist reports from customers.</p>
          </div>
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-sm text-muted-foreground">Loading reports...</CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Flag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No reports yet</p>
              <p className="text-sm text-muted-foreground">Reported listings will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{report.artwork?.title || "Unknown listing"}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reported by {report.reporter?.email || "unknown user"} on {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant[report.status]} className="capitalize">{report.status}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[120px_1fr_320px]">
                  <div className="overflow-hidden rounded-md border bg-muted">
                    {report.artwork?.image_url ? (
                      <img src={report.artwork.image_url} alt="" className="aspect-square h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Reason:</span> {report.reason}</p>
                    <p><span className="font-medium">Details:</span> {report.details || "No details provided."}</p>
                    <p><span className="font-medium">Artist:</span> {report.artist?.email || report.artist_id || "Unknown"}</p>
                    {report.artwork_id ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/artwork/${report.artwork_id}`}>Open listing</Link>
                      </Button>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      value={notes[report.id] ?? report.admin_notes ?? ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))}
                      placeholder="Admin notes"
                      rows={4}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateStatus(report, "reviewing")}>Review</Button>
                      <Button size="sm" onClick={() => updateStatus(report, "resolved")}>Resolve</Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(report, "dismissed")}>Dismiss</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
