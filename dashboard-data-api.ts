import { NextRequest, NextResponse } from 'next/server'

/**
 * Dashboard Data API
 * Provides data for the Cognitive Dashboard
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || 'current-user'
    const projectId = searchParams.get('projectId') || 'default-project'

    console.log('[Dashboard API] Loading data for:', { userId, projectId })

    // Mock data for now - will connect to actual cognitive systems
    const dashboardData = {
      success: true,
      data: {
        // System Health
        health: {
          overall: 'healthy',
          score: 0.87,
          status: 'All Systems Operational'
        },

        // Component Health
        components: {
          perception: {
            status: 'operational',
            message: 'Processing images + text with GPT-4o'
          },
          planning: {
            status: 'operational',
            message: 'Front-loaded planning with specialized agents'
          },
          retrieval: {
            status: 'operational',
            message: 'Semantic search and retrieval working'
          },
          memory: {
            status: 'operational',
            message: 'Long-term memory storing user + project context'
          },
          intelligence: {
            status: 'operational',
            message: 'Self-improvement system learning from feedback'
          },
          understanding: {
            status: 'operational',
            message: 'Deep content analysis scanning projects'
          },
          unified: {
            status: 'operational',
            message: 'All 7 systems integrated and coordinated'
          }
        },

        // Metrics
        metrics: {
          totalMemories: 89,
          totalAnalyses: 237,
          avgConfidence: 0.87,
          recentInteractions: 47,
          systemLoad: 120
        },

        // User Preferences
        preferences: {
          tone: 'conversational',
          style: 'professional',
          length: 15,
          complexity: 'intermediate',
          structure: 'intro-body-conclusion',
          voice: 'tongtong',
          confidence: 0.89
        },

        // Project Analysis
        project: {
          projectId,
          totalFiles: 237,
          themes: [
            'Microservices Architecture',
            'API Design Patterns',
            'REST vs GraphQL',
            'Authentication Strategies',
            'Database Scalability',
            'Performance Optimization'
          ],
          concepts: [
            'microservices',
            'monolith',
            'API gateway',
            'load balancing',
            'circuit breaker',
            'JWT',
            'OAuth 2.0',
            'PostgreSQL',
            'MongoDB',
            'Redis caching',
            'database sharding'
          ],
          relationships: {
            'microservices': ['architecture', 'API design', 'scalability'],
            'API': ['microservices', 'REST', 'GraphQL', 'authentication']
          },
          complexity: 'intermediate',
          targetAudience: 'developers & architects',
          suggestedEpisodes: [
            {
              title: 'Episode 1: Introduction to Microservices',
              description: 'Overview of microservices concepts and benefits',
              duration: 15,
              topics: ['concepts', 'benefits', 'use cases']
            },
            {
              title: 'Episode 2: API Design Patterns',
              description: 'REST vs GraphQL comparison and best practices',
              duration: 15,
              topics: ['REST', 'GraphQL', 'comparison', 'patterns']
            }
          ],
          lastAnalyzed: new Date().toISOString()
        },

        // Learning & Improvement
        learning: {
          feedbackProcessed: 47,
          personalizationAccuracy: 0.87,
          adaptationLevel: 0.65,
          adaptationTrend: 'improving',
          confidence: 0.87,
          successfulPatterns: [
            'Use real-world examples',
            'Keep language simple and accessible',
            'Provide clear structure'
          ],
          avoidedMistakes: [
            'Avoid technical jargon when unnecessary',
            'Avoid overly long episodes without breaks'
          ],
          lastUpdated: new Date().toISOString()
        },

        // Recent Activity
        activity: [
          {
            id: '1',
            type: 'podcast_created',
            message: 'Created podcast about microservices architecture',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            outcome: 'success'
          },
          {
            id: '2',
            type: 'script_refined',
            message: 'Refined script based on user feedback',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            outcome: 'success'
          },
          {
            id: '3',
            type: 'feedback_received',
            message: 'Received feedback on podcast episode',
            timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
            outcome: 'success'
          },
          {
            id: '4',
            type: 'memory_updated',
            message: 'System learned your preference for conversational tone',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            outcome: 'success'
          }
        ],

        // Recommendations
        recommendations: [
          {
            type: 'personalization',
            priority: 'high',
            title: 'Continue Using Conversational Tone',
            description: 'You prefer conversational tone in 89% of your podcasts',
            action: 'maintain_tone',
            confidence: 0.89
          },
          {
            type: 'content',
            priority: 'medium',
            title: 'Explore Deep Dive Content',
            description: `Found 6 themes - consider creating focused series`,
            action: 'create_series',
            confidence: 0.82
          },
          {
            type: 'learning',
            priority: 'high',
            title: 'Great Progress!',
            description: 'Your adaptation level improved 12% this week',
            action: 'keep_learning',
            confidence: 0.90
          }
        ]
      },

      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: 120,
        userId,
        projectId,
        systemsConnected: 7,
        dataFreshness: 'fresh'
      }
    }

    console.log('[Dashboard API] Data loaded:', {
      processingTime: dashboardData.metadata.processingTime,
      overallHealth: dashboardData.data.health.overall
    })

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('[Dashboard API] Error:', error)

    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        timestamp: new Date().toISOString(),
        type: 'dashboard_data_error'
      }
    }, { status: 500 })
  }
}
