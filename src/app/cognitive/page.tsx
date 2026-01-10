'use client'

import { Brain, Activity, TrendingUp, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'

// Import lightweight dashboard widget
const CognitiveDashboard = dynamic(
  () => import('../../components/cognitive-dashboard-widget'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-4 text-center">
          <Activity className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground">Loading Cognitive AI Dashboard...</h2>
          <p className="text-muted-foreground">Preparing your personalized experience</p>
        </div>
      </div>
    )
  }
)

export default function CognitiveAIPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-primary/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Cognitive AI Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  See how the system understands, remembers, learns, and evolves
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">System Intelligence</p>
                <p className="text-lg font-bold text-primary">87/100</p>
              </div>
              <div className="h-px w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Cognitive AI-Native
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Dashboard Widget */}
      <div className="container mx-auto px-6 py-8">
        <CognitiveDashboard userId="current-user" />
      </div>

      {/* Page Footer */}
      <div className="border-t bg-muted/30 mt-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Powered by 7 cognitive AI systems working in harmony
            </p>
            <p>
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
