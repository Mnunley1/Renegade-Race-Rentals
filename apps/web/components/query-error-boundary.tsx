"use client"

import { Component, type ReactNode } from "react"

type QueryErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type QueryErrorBoundaryState = {
  hasError: boolean
}

/** Hides children when a Convex query throws (e.g. functions not yet deployed). */
export class QueryErrorBoundary extends Component<
  QueryErrorBoundaryProps,
  QueryErrorBoundaryState
> {
  state: QueryErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): QueryErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
