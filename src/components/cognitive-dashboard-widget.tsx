'use client'

/**
 * Lightweight Cognitive Dashboard Widget
 * Shows key cognitive AI metrics
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, Activity, TrendingUp, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface CognitiveData {
  health: {
    overall: string
    score: number
    status: string
  }
  metrics: {
    totalMemories: number
    totalAnalyses: number
    avgConfidence: number
    recentInteractions: number
  }
  preferences: {
    tone: string
    style: string
    confidence: number
  }
}

export function CognitiveDashboardWidget({ userId = 'current-user' }: { userId: string }) {
  const [data, setData] = useState<CognitiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState('')

  useEffect(() => {
    loadDashboard()
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cognitive/dashboard-data?userId=${userId}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setLastRefresh(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('[Cognitive Dashboard] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadDashboard()
  }

  const getHealthColor = () => {
    if (!data) return 'text-gray-500'
    return data.health.score > 0.8 ? 'text-green-500' : 
           data.health.score > 0.5 ? 'text-yellow-500' : 
           'text-red-500'
  }

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-y-4">
          <Activity className="h-6 w-6 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading cognitive dashboard...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Cognitive AI</h2>
          <Badge variant="outline" className="text-xs">Cognitive AI-Native</Badge>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : `Refresh (${lastRefresh})`}</span>
        </button>
      </div>

      {/* System Health */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Intelligence
            </h3>
            {data && (
              <div className={`flex items-center gap-2 ${getHealthColor()}`}>
                {data.health.score > 0.8 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : data.health.score > 0.5 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {data.health.score > 0.8 ? 'Excellent' : data.health.score > 0.5 ? 'Good' : 'Learning'}
                </span>
              </div>
            )}
          </div>

          {data && (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {data.metrics.totalMemories}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total Memories
                  </div>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {data.metrics.totalAnalyses}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Content Analyses
                  </div>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {(data.metrics.avgConfidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    AI Confidence
                  </div>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {data.metrics.recentInteractions}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Recent Interactions
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Intelligence</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <Progress value={(data.health.score || 0) * 100} max={100} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  System is {data.health.score > 0.8 ? 'highly intelligent' : data.health.score > 0.5 ? 'intelligent' : 'adapting'} based on {data.metrics.totalAnalyses} content analyses and {data.metrics.totalMemories} learned preferences
                </p>
              </div>
            </div>
          )}

          {data && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Your Preferences</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-primary/5 rounded">
                  <div className="text-sm text-muted-foreground">Tone</div>
                  <div className="font-medium capitalize mt-1">{data.preferences?.tone || 'Learning...'}</div>
                  <Progress value={(data.preferences?.confidence || 0) * 100} max={100} className="h-2 mt-2" />
                </div>
                <div className="p-3 bg-primary/5 rounded">
                  <div className="text-sm text-muted-foreground">Style</div>
                  <div className="font-medium capitalize mt-1">{data.preferences?.style || 'Learning...'}</div>
                  <Progress value={(data.preferences?.confidence || 0) * 100} max={100} className="h-2 mt-2" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Based on your {data.metrics.recentInteractions} interactions, the system has personalized to your preferences with {(data.preferences?.confidence || 0) * 100}% confidence.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="p-4 bg-primary/5 border rounded-lg hover:bg-primary/10 transition-colors text-left">
            <div className="font-medium">Create with AI</div>
            <div className="text-xs text-muted-foreground mt-1">
              Use all cognitive AI features
            </div>
          </button>
          <button className="p-4 bg-primary/5 border rounded-lg hover:bg-primary/10 transition-colors text-left">
            <div className="font-medium">View Preferences</div>
            <div className="text-xs text-muted-foreground mt-1">
              See your personalized profile
            </div>
          </button>
          <button className="p-4 bg-primary/5 border rounded-lg hover:bg-primary/10 transition-colors text-left">
            <div className="font-medium">Project Intelligence</div>
            <div className="text-xs text-muted-foreground mt-1">
              See content analysis
            </div>
          </button>
          <button className="p-4 bg-primary/5 border rounded-lg hover:bg-primary/10 transition-colors text-left">
            <div className="font-medium">Learning Progress</div>
            <div className="text-xs text-muted-foreground mt-1">
              See how system adapts
            </div>
          </button>
        </div>
      </Card>
    </div>
  )
}
