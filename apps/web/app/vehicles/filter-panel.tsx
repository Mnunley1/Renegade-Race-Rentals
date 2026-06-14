"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Filter } from "lucide-react"
import { FilterSections } from "./filter-sections"
import type { FilterActions, FilterState, TrackItem, VehicleItem } from "./types"

type FilterPanelProps = {
  filters: FilterState
  actions: FilterActions
  tracks: TrackItem[]
  vehicles: VehicleItem[]
  activeFiltersCount: number
  isLoading?: boolean
}

export function FilterPanel({
  filters,
  actions,
  tracks,
  vehicles,
  activeFiltersCount,
  isLoading = false,
}: FilterPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="size-5" />
            <h2 className="font-semibold text-lg">Filters</h2>
            {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
          </div>
          {activeFiltersCount > 0 && (
            <button
              className="font-medium text-primary text-sm hover:underline"
              onClick={actions.clearFilters}
              type="button"
            >
              Clear all
            </button>
          )}
        </div>

        <FilterSections actions={actions} filters={filters} tracks={tracks} vehicles={vehicles} />
      </div>
    </Card>
  )
}
