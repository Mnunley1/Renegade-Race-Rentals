"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useQuery } from "convex/react"
import { Eye, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { type Column, DataTable } from "@/components/data-table/data-table"
import { exportToCSV } from "@/components/data-table/data-table-export"
import { DataTableToolbar, type FilterConfig } from "@/components/data-table/data-table-toolbar"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { api } from "@/lib/convex"

type VerificationStatus = "pending" | "verified" | "rejected"

export default function CoachesPage() {
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const coaches = useQuery(api.coachProfiles.getCoachesForAdmin, {
    verificationStatus: statusFilter,
    search: searchQuery || undefined,
    limit: 100,
  })

  const columns: Column<any>[] = [
    {
      key: "coach",
      header: "Coach",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.user?.name || "Unknown"}</span>
          <span className="text-muted-foreground text-xs">{row.user?.email || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.verificationStatus} />,
    },
    {
      key: "location",
      header: "Location",
      cell: (row) => row.location || "N/A",
    },
    {
      key: "rating",
      header: "Rating",
      cell: (row) => (
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          {row.rating?.toFixed?.(1) ?? "0.0"}
          <span className="text-muted-foreground text-xs">({row.reviewCount ?? 0})</span>
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.rating ?? 0,
    },
    {
      key: "active",
      header: "Active",
      cell: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} />,
    },
    {
      key: "date",
      header: "Created",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      sortable: true,
      sortValue: (row) => new Date(row.createdAt).getTime(),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <Link href={`/coaching/coaches/${row._id}`}>
          <Button size="sm" variant="outline">
            <Eye className="mr-2 size-4" />
            View Details
          </Button>
        </Link>
      ),
    },
  ]

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Verified", value: "verified" },
        { label: "Rejected", value: "rejected" },
      ],
      value: statusFilter,
      onChange: (value) => setStatusFilter(value as VerificationStatus | undefined),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader description="Vet and manage coach profiles" title="Coaches" />

      <Card>
        <CardHeader>
          <CardTitle>All Coaches</CardTitle>
          <CardDescription>{coaches?.length || 0} coach(es) found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={coaches ?? []}
            emptyMessage="No coaches found"
            getRowId={(row) => row._id}
            isLoading={coaches === undefined}
            toolbar={
              <DataTableToolbar
                filters={filters}
                onExport={() =>
                  exportToCSV(
                    coaches ?? [],
                    [
                      { key: "name", header: "Name", value: (r) => r.user?.name ?? "Unknown" },
                      { key: "email", header: "Email", value: (r) => r.user?.email ?? "" },
                      {
                        key: "status",
                        header: "Status",
                        value: (r) => r.verificationStatus ?? "pending",
                      },
                      { key: "location", header: "Location", value: (r) => r.location ?? "" },
                      { key: "rating", header: "Rating", value: (r) => r.rating ?? 0 },
                      { key: "reviews", header: "Reviews", value: (r) => r.reviewCount ?? 0 },
                      {
                        key: "active",
                        header: "Active",
                        value: (r) => (r.isActive ? "Yes" : "No"),
                      },
                      {
                        key: "date",
                        header: "Created",
                        value: (r) =>
                          new Date(r.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }),
                      },
                    ],
                    "coaches"
                  )
                }
                onSearchChange={setSearchQuery}
                search={searchQuery}
                searchPlaceholder="Search coaches..."
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
