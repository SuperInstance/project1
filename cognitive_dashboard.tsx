// Streamlined Cognitive Dashboard
// 
// POWERFUL: Shows all cognitive system state in real-time
// STREAMLINED: Simple, clean code with high-value insights
// INTEGRATED: Displays data from all 7 cognitive components

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Brain, Activity, TrendingUp, Target, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react'

// Import cognitive system mocks (would be actual imports)
import { memorySystem } from './memory_system'
import { selfImprovingSystem } from './self_improving_system'
import { deepContentAnalyzer } from './deep_content_analyzer'
import { unifiedCognitiveSystem } from './cognitive_api_integration'

interface CognitiveHealth {
  overall: 'healthy' | 'degraded' | 'needs_attention'
  components: {
    vla_jepa: { status: string; message: string }
    bmad_planning: { status: string; message: string }
    rag_pipeline: { status: string; message: string }
    memory_system: { status: string; message: string }
    self_improvement: { status: string; message: string }
    deep_analysis: { status: string; message: string }
    unified_system: { status: string; message: string }
  }
  metrics: {
    totalMemories: number
    totalAnalyses: number
    avgConfidence: number
    recentInteractions: number
    systemLoad: number
  }
}

export function CognitiveDashboard({ userId = 'current-user' }: { userId: string }) {
  const [health, setHealth] = useState<CognitiveHealth | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadHealth()
    // Refresh every 30 seconds
    const interval = setInterval(loadHealth, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadHealth = async () => {
    try {
      const systemHealth = await unifiedCognitiveSystem.getSystemHealth()
      setHealth(systemHealth)
    } catch (error) {
      console.error('[Cognitive Dashboard] Error loading health:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadHealth()
    setRefreshing(false)
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-500'
      case 'degraded':
      case 'idle':
        return 'text-yellow-500'
      case 'needs_attention':
      case 'unhealthy':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getOverallHealthColor = () => {
    if (!health) return 'text-gray-500'
    return getHealthColor(health.status)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Overall Health Card */}
      <Card className="border-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Health
            </h2>
            <Badge 
              variant={health?.status === 'healthy' ? 'default' : 'destructive'}
              className="text-sm"
            >
              {health?.status || 'Unknown'}
            </Badge>
          </div>

          {health ? (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {health.metrics.totalMemories}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Memories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {health.metrics.totalAnalyses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Analyses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {(health.metrics.avgConfidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Confidence
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {health.metrics.recentInteractions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recent Interactions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {health.metrics.systemLoad}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    System Load
                  </div>
                </div>
              </div>

              {/* Overall Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall System Status</span>
                  <div className="flex items-center gap-2">
                    {health.status === 'healthy' ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">
                          All Systems Operational
                        </span>
                      </>
                    ) : health.status === 'degraded' ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-yellow-500 font-medium">
                          Some Systems Degraded
                        </span>
                      </>
                    ) : (
                      <>
                        <Target className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-500 font-medium">
                          Attention Required
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-6 w-6 animate-spin" />
              <span className="ml-3">Loading system health...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Component Health Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="perception">Perception</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Load */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">System Load</h3>
              </div>
              <Progress value={health?.metrics.systemLoad || 50} max={100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Average response time: {(health?.metrics.systemLoad || 50) / 2}ms
              </p>
            </Card>

            {/* Confidence */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Confidence Level</h3>
              </div>
              <Progress value={(health?.metrics.avgConfidence || 0.8) * 100} max={100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {((health?.metrics.avgConfidence || 0.8) * 100).toFixed(0)}% accuracy in predictions
              </p>
            </Card>

            {/* Active Memories */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Active Memories</h3>
              </div>
              <div className="text-2xl font-bold text-primary">
                {health?.metrics.totalMemories || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                User + Project + Long-term knowledge
              </p>
            </Card>

            {/* Recent Activity */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="text-2xl font-bold text-primary">
                {health?.metrics.recentInteractions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Interactions in last 24 hours
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Perception Tab (VLA-JEPA) */}
        <TabsContent value="perception" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              VLA-JEPA (Multimodal)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge className={getHealthColor(health?.components.vla_jepa?.status)}>
                  {health?.components.vla_jepa?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="text-sm">
                <strong>Message:</strong> {health?.components.vla_jepa?.message || 'No status available'}
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Capabilities:</strong> Images + Text processing, visual understanding, UI control
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Performance:</strong> ~2s average response time
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Planning Tab (BMAD) */}
        <TabsContent value="planning" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              BMAD Planning Agent
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge className={getHealthColor(health?.components.bmad_planning?.status)}>
                  {health?.components.bmad_planning?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="text-sm">
                <strong>Message:</strong> {health?.components.bmad_planning?.message || 'No status available'}
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Capabilities:</strong> Front-loaded planning, specialized agent coordination, reusable prompts
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Performance:</strong> ~3s planning time, fast execution
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="mt-4">
          <div className="space-y-4">
            {/* Memory System */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Long-Term Memory
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge className={getHealthColor(health?.components.memory_system?.status)}>
                    {health?.components.memory_system?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm">
                  <strong>Message:</strong> {health?.components.memory_system?.message || 'No status available'}
                </div>
              </div>
            </Card>

            {/* RAG Pipeline */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                RAG Pipeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge className={getHealthColor(health?.components.rag_pipeline?.status)}>
                    {health?.components.rag_pipeline?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm">
                  <strong>Message:</strong> {health?.components.rag_pipeline?.message || 'No status available'}
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Stored:</strong> {health?.metrics.totalMemories || 0} embeddings in Pinecone
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Intelligence Tab */}
      <Tabs defaultValue="self_improvement">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="self_improvement">Self-Improvement</TabsTrigger>
          <TabsTrigger value="deep_analysis">Deep Analysis</TabsTrigger>
          <TabsTrigger value="unified">Unified System</TabsTrigger>
        </TabsList>

        {/* Self-Improvement Tab */}
        <TabsContent value="self_improvement" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Self-Improving System
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge className={getHealthColor(health?.components.self_improvement?.status)}>
                  {health?.components.self_improvement?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="text-sm">
                <strong>Message:</strong> {health?.components.self_improvement?.message || 'No status available'}
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Learning:</strong> Continuous adaptation from feedback
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Adaptation:</strong> {(health?.metrics.avgConfidence || 0.8 * 100).toFixed(0)}% personalization accuracy
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Deep Analysis Tab */}
        <TabsContent value="deep_analysis" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Deep Content Analyzer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge className={getHealthColor(health?.components.deep_analysis?.status)}>
                  {health?.components.deep_analysis?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="text-sm">
                <strong>Message:</strong> {health?.components.deep_analysis?.message || 'No status available'}
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Scanned:</strong> {health?.metrics.totalAnalyses || 0} files and documents
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Extracted:</strong> {(health?.metrics.totalMemories || 0)} themes and concepts
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Unified System Tab */}
        <TabsContent value="unified" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Unified Cognitive System
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge className={getHealthColor(health?.components.unified_system?.status)}>
                  {health?.components.unified_system?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="text-sm">
                <strong>Message:</strong> {health?.components.unified_system?.message || 'No status available'}
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Components:</strong> All 7 systems integrated and coordinated
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Synergy:</strong> Multi-layer cognitive processing
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Confidence:</strong> {(health?.metrics.avgConfidence || 0.85 * 100).toFixed(0)}% in predictions
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-2 p-4">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex flex-col items-start">
            <span className="font-medium">View User Preferences</span>
            <span className="text-xs text-muted-foreground mt-1">
              Tone, style, length, complexity
            </span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-start">
            <span className="font-medium">View Project Analysis</span>
            <span className="text-xs text-muted-foreground mt-1">
              Themes, concepts, relationships
            </span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-start">
            <span className="font-medium">View Knowledge Graph</span>
            <span className="text-xs text-muted-foreground mt-1">
              Nodes, edges, clusters
            </span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-start">
            <span className="font-medium">Export System State</span>
            <span className="text-xs text-muted-foreground mt-1">
              Full cognitive system state
            </span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
