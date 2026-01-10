'use client'

/**
 * Cognitive Dashboard - User-Facing Component
 * Makes all cognitive AI systems visible to users
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Brain, Activity, TrendingUp, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react'

export function CognitiveDashboard({ userId = 'current-user' }: { userId: string }) {
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [userId])

  const loadDashboard = async () => {
    try {
      const response = await fetch(`/api/cognitive/dashboard-data?userId=${userId}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('[Cognitive Dashboard] Error:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  const getHealthColor = (status: string) => {
    return status === 'healthy' || status === 'operational' 
      ? 'text-green-500' 
      : status === 'degraded' || status === 'idle' 
      ? 'text-yellow-500' 
      : 'text-red-500'
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 text-primary animate-spin" />
        <span className="ml-3">Loading cognitive dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cognitive AI Dashboard</h1>
          <Badge variant="outline" className="ml-2">Cognitive AI-Native</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Overall Health */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">System Health</h2>
            <Badge 
              variant={data.health.status === 'healthy' ? 'default' : 'destructive'}
              className={getHealthColor(data.health.status)}
            >
              {data.health.status.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{data.metrics.totalMemories}</div>
                <div className="text-sm text-muted-foreground">Total Memories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{data.metrics.totalAnalyses}</div>
                <div className="text-sm text-muted-foreground">Total Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{(data.metrics.avgConfidence * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{data.metrics.recentInteractions}</div>
                <div className="text-sm text-muted-foreground">Recent Interactions</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Component Status */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Cognitive Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'perception', name: 'VLA-JEPA (Multimodal)', icon: Brain },
            { key: 'planning', name: 'BMAD Planning Agent', icon: Target },
            { key: 'retrieval', name: 'RAG + Memory', icon: Activity },
            { key: 'intelligence', name: 'Self-Improvement', icon: TrendingUp },
            { key: 'understanding', name: 'Deep Content Analyzer', icon: Zap }
          ].map(({ key, name, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{name}</span>
              </div>
              <Badge className={getHealthColor('operational')}>OPERATIONAL</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* User Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Your Personalized Profile</h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tone</span>
              <span className="font-medium capitalize">{data.preferences?.tone || 'Not learned yet'}</span>
            </div>
            <Progress value={data.preferences?.confidence || 0} * 100} max={100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Style</span>
              <span className="font-medium capitalize">{data.preferences?.style || 'Not learned yet'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Length</span>
              <span className="font-medium">{data.preferences?.length || 20} minutes</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function UserIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
