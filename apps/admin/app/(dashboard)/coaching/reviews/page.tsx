"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useMutation, useQuery } from "convex/react"
import { CheckCircle, Eye, EyeOff, Loader2, Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { type Column, DataTable } from "@/components/data-table/data-table"
import { exportToCSV } from "@/components/data-table/data-table-export"
import { DataTableToolbar, type FilterConfig } from "@/components/data-table/data-table-toolbar"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

function getReviewStatus(review: any) {
  if (!review.isPublic) return "hidden"
  if (!review.isModerated) return "unmoderated"
  return "published"
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          className={`size-3.5 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          key={star}
        />
      ))}
      <span className="ml-1 text-sm">{rating}</span>
    </div>
  )
}

export default function CoachingReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isPublicFilter, setIsPublicFilter] = useState<boolean | undefined>(undefined)
  const [isModeratedFilter, setIsModeratedFilter] = useState<boolean | undefined>(undefined)

  const reviews = useQuery(api.coachingReviews.getAllCoachingReviews, {
    limit: 100,
    search: searchQuery || undefined,
    isPublic: isPublicFilter,
    isModerated: isModeratedFilter,
  })

  const deleteReview = useMutation(api.coachingReviews.deleteCoachingReviewAsAdmin)
  const toggleVisibility = useMutation(api.coachingReviews.toggleCoachingReviewVisibility)
  const markModerated = useMutation(api.coachingReviews.markCoachingReviewModerated)

  const [processingId, setProcessingId] = useState<Id<"coachingReviews"> | null>(null)

  const handleDelete = async (reviewId: Id<"coachingReviews">) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone."))
      return

    setProcessingId(reviewId)
    try {
      await deleteReview({ reviewId })
      toast.success("Review deleted successfully")
    } catch (error) {
      handleErrorWithContext(error, { action: "delete review", entity: "review" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleToggleVisibility = async (
    reviewId: Id<"coachingReviews">,
    currentVisibility: boolean
  ) => {
    setProcessingId(reviewId)
    try {
      await toggleVisibility({ reviewId })
      toast.success(`Review ${currentVisibility ? "hidden" : "published"} successfully`)
    } catch (error) {
      handleErrorWithContext(error, { action: "toggle visibility", entity: "review" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkModerated = async (reviewId: Id<"coachingReviews">) => {
    setProcessingId(reviewId)
    try {
      await markModerated({ reviewId })
      toast.success("Review marked as moderated")
    } catch (error) {
      handleErrorWithContext(error, { action: "mark as moderated", entity: "review" })
    } finally {
      setProcessingId(null)
    }
  }

  const columns: Column<any>[] = [
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={getReviewStatus(row)} />,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (row) => <RatingStars rating={row.rating} />,
      sortable: true,
      sortValue: (row) => row.rating,
    },
    {
      key: "title",
      header: "Title",
      cell: (row) => (
        <span className="inline-block max-w-[200px] truncate font-medium" title={row.title}>
          {row.title}
        </span>
      ),
    },
    {
      key: "reviewer",
      header: "Reviewer",
      cell: (row) => row.reviewer?.name || "Unknown",
    },
    {
      key: "coach",
      header: "Coach",
      cell: (row) => (
        <span className="inline-block max-w-[200px] truncate" title={row.coachHeadline}>
          {row.coachHeadline || "N/A"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
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
      cell: (row) => {
        const isProcessing = processingId === row._id
        const VisibilityIcon = row.isPublic ? EyeOff : Eye
        return (
          <div className="flex gap-1">
            {!row.isModerated && (
              <Button
                disabled={isProcessing}
                onClick={() => handleMarkModerated(row._id)}
                size="sm"
                title="Mark Moderated"
                variant="outline"
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
              </Button>
            )}
            <Button
              disabled={isProcessing}
              onClick={() => handleToggleVisibility(row._id, row.isPublic)}
              size="sm"
              title={row.isPublic ? "Hide" : "Show"}
              variant="outline"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <VisibilityIcon className="size-4" />
              )}
            </Button>
            <Button
              disabled={isProcessing}
              onClick={() => handleDelete(row._id)}
              size="sm"
              title="Delete"
              variant="destructive"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>
        )
      },
    },
  ]

  let visibilityFilterValue: string | undefined
  if (isPublicFilter === undefined) visibilityFilterValue = undefined
  else visibilityFilterValue = isPublicFilter ? "public" : "hidden"

  let moderationFilterValue: string | undefined
  if (isModeratedFilter === undefined) moderationFilterValue = undefined
  else moderationFilterValue = isModeratedFilter ? "moderated" : "unmoderated"

  const filters: FilterConfig[] = [
    {
      key: "visibility",
      label: "Visibility",
      options: [
        { label: "Public", value: "public" },
        { label: "Hidden", value: "hidden" },
      ],
      value: visibilityFilterValue,
      onChange: (value) => setIsPublicFilter(value === undefined ? undefined : value === "public"),
    },
    {
      key: "moderation",
      label: "Moderation",
      options: [
        { label: "Moderated", value: "moderated" },
        { label: "Unmoderated", value: "unmoderated" },
      ],
      value: moderationFilterValue,
      onChange: (value) =>
        setIsModeratedFilter(value === undefined ? undefined : value === "moderated"),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader description="Moderate and manage coaching reviews" title="Coaching Reviews" />

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>{reviews?.length || 0} review(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reviews ?? []}
            emptyMessage="No reviews found"
            getRowId={(row) => row._id}
            isLoading={reviews === undefined}
            toolbar={
              <DataTableToolbar
                filters={filters}
                onExport={() =>
                  exportToCSV(
                    reviews ?? [],
                    [
                      {
                        key: "status",
                        header: "Status",
                        value: (r) => getReviewStatus(r),
                      },
                      { key: "rating", header: "Rating", value: (r) => r.rating },
                      { key: "title", header: "Title", value: (r) => r.title ?? "" },
                      {
                        key: "reviewer",
                        header: "Reviewer",
                        value: (r) => r.reviewer?.name ?? "Unknown",
                      },
                      { key: "coach", header: "Coach", value: (r) => r.coachHeadline ?? "" },
                      {
                        key: "date",
                        header: "Date",
                        value: (r) =>
                          new Date(r.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }),
                      },
                    ],
                    "coaching-reviews"
                  )
                }
                onSearchChange={setSearchQuery}
                search={searchQuery}
                searchPlaceholder="Search reviews..."
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
