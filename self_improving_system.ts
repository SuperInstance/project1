// Self-Improving Framework for Cognitive AI-Native Podcast Maker
// 
// This system learns from user feedback and interactions
// and continuously improves AI performance and personalization

export interface FeedbackData {
  type: 'podcast_quality' | 'script_quality' | 'audio_quality' | 'overall_experience'
  scriptId?: string
  episodeId?: string
  rating: 1 | 2 | 3 | 4 | 5
  aspects: {
    liked?: string[]
    disliked?: string[]
    neutral?: string[]
  }
  suggestions?: string
  timestamp: string
}

export interface ImprovementMetrics {
  user: string
  project: string
  metrics: {
    overallSatisfaction: number
    scriptQuality: number
    audioQuality: number
    generationSpeed: number
    personalizationAccuracy: number
  }
  trends: {
    improving: string[]
    declining: string[]
    stable: string[]
  }
  adaptations: {
    preferences: PreferenceModel
    patterns: PatternModel
    weights: WeightModel
  }
}

export interface PreferenceModel {
  tone: {
    'formal': number
    'conversational': number
    'enthusiastic': number
    'serious': number
    'humorous': number
  }
  length: {
    'short_5-10min': number
    'medium_15-20min': number
    'long_30-45min': number
  }
  complexity: {
    'beginner': number
    'intermediate': number
    'advanced': number
  }
  structure: {
    'intro-main-conclusion': number
    'multiple_segments': number
    'continuous_flow': number
  }
  topics: {
    'technical': number
    'educational': number
    'entertainment': number
    'news': number
  }
}

export interface PatternModel {
  successful: {
    scriptApproaches: Map<string, number>
    audioApproaches: Map<string, number>
    structureApproaches: Map<string, number>
    toneApproaches: Map<string, number>
  }
  avoided: {
    mistakes: Map<string, number>
    topics: Map<string, number>
    structures: Map<string, number>
  }
  userSpecific: Map<string, any>
}

export interface WeightModel {
  scriptGeneration: number
  audioGeneration: number
  personalization: number
  qualityScoring: number
  speedOptimization: number
}

// Self-Improving System
class SelfImprovingSystem {
  private metrics: Map<string, ImprovementMetrics> = new Map()
  private preferences: Map<string, PreferenceModel> = new Map()
  private patterns: Map<string, PatternModel> = new Map()
  private weights: WeightModel = {
    scriptGeneration: 1.0,
    audioGeneration: 1.0,
    personalization: 0.8, // Start conservative
    qualityScoring: 1.0,
    speedOptimization: 1.0
  }

  /**
   * Process user feedback and update models
   * 
   * @param feedback - User's feedback on generation
   * @param userId - User identifier
   * @param projectId - Project identifier
   */
  async processFeedback(
    feedback: FeedbackData,
    userId: string,
    projectId: string
  ): Promise<{
    success: boolean;
    adaptations: string[];
    confidence: number;
  }> {
    console.log('[Self-Improving] Processing feedback:', {
      type: feedback.type,
      rating: feedback.rating,
      userId,
      projectId
    })

    // Step 1: Update metrics
    this.updateMetrics(userId, projectId, feedback)

    // Step 2: Analyze feedback patterns
    const patterns = this.analyzeFeedbackPatterns(userId, feedback)

    // Step 3: Update preferences based on feedback
    const preferenceAdaptations = this.updatePreferences(userId, feedback)

    // Step 4: Identify successful and avoided patterns
    const patternUpdates = this.updatePatterns(userId, patterns, feedback)

    // Step 5: Recalculate weights based on performance
    const weightUpdates = this.recalculateWeights(userId, feedback)

    // Step 6: Generate adaptive suggestions
    const adaptiveSuggestions = this.generateAdaptiveSuggestions(userId, feedback)

    const adaptations = [
      ...preferenceAdaptations,
      ...patternUpdates,
      ...weightUpdates,
      ...adaptiveSuggestions
    ]

    const confidence = this.calculateConfidence(feedback, patterns)

    console.log('[Self-Improving] Feedback processed, adaptations generated:', {
      adaptations: adaptations.length,
      confidence
    })

    return {
      success: true,
      adaptations,
      confidence
    }
  }

  /**
   * Update user and project metrics
   */
  private updateMetrics(userId: string, projectId: string, feedback: FeedbackData): void {
    if (!this.metrics.has(userId)) {
      this.metrics.set(userId, {
        user: userId,
        project: projectId,
        metrics: {
          overallSatisfaction: feedback.rating,
          scriptQuality: feedback.type === 'script_quality' ? feedback.rating : 3,
          audioQuality: feedback.type === 'audio_quality' ? feedback.rating : 3,
          generationSpeed: 3,
          personalizationAccuracy: 0.8
        },
        trends: {
          improving: [],
          declining: [],
          stable: []
        },
        adaptations: {
          preferences: this.initializePreferences(),
          patterns: this.initializePatterns(),
          weights: { ...this.weights }
        }
      })
    } else {
      const userMetrics = this.metrics.get(userId)!
      
      // Update specific metric
      if (feedback.type === 'script_quality') {
        userMetrics.metrics.scriptQuality = 
          (userMetrics.metrics.scriptQuality * (userMetrics.metrics.scriptQuality.length - 1) + feedback.rating) / userMetrics.metrics.scriptQuality.length
      }
      
      if (feedback.type === 'audio_quality') {
        userMetrics.metrics.audioQuality = 
          (userMetrics.metrics.audioQuality * (userMetrics.metrics.audioQuality.length - 1) + feedback.rating) / userMetrics.metrics.audioQuality.length
      }
      
      if (feedback.type === 'overall_experience') {
        userMetrics.metrics.overallSatisfaction = 
          (userMetrics.metrics.overallSatisfaction * (userMetrics.metrics.overallSatisfaction.length - 1) + feedback.rating) / userMetrics.metrics.overallSatisfaction.length
      }
      
      // Track trends
      if (feedback.rating >= 4) {
        userMetrics.trends.improving.push(`${feedback.type}_high_rating`)
      } else if (feedback.rating <= 2) {
        userMetrics.trends.declining.push(`${feedback.type}_low_rating`)
      } else {
        userMetrics.trends.stable.push(`${feedback.type}_stable_rating`)
      }
      
      this.metrics.set(userId, userMetrics)
    }
  }

  /**
   * Analyze patterns in user feedback
   */
  private analyzeFeedbackPatterns(userId: string, feedback: FeedbackData): Map<string, number> {
    const patterns = this.patterns.get(userId) || this.initializePatterns()
    
    // Process liked aspects
    if (feedback.aspects.liked) {
      for (const aspect of feedback.aspects.liked) {
        const count = patterns.successful.scriptApproaches.get(aspect) || 0
        patterns.successful.scriptApproaches.set(aspect, count + 1)
      }
    }
    
    // Process disliked aspects
    if (feedback.aspects.disliked) {
      for (const aspect of feedback.aspects.disliked) {
        const count = patterns.avoided.mistakes.get(aspect) || 0
        patterns.avoided.mistakes.set(aspect, count + 1)
      }
    }
    
    this.patterns.set(userId, patterns)
    
    return new Map([
      ...patterns.successful.scriptApproaches,
      ...patterns.avoided.mistakes
    ])
  }

  /**
   * Update user preferences based on feedback
   */
  private updatePreferences(userId: string, feedback: FeedbackData): string[] {
    const adaptations: string[] = []
    const userPrefs = this.preferences.get(userId) || this.initializePreferences()
    
    // Process liked aspects (strengthen preferences)
    if (feedback.aspects.liked) {
      for (const aspect of feedback.aspects.liked) {
        // Map liked aspects to preference categories
        if (aspect.includes('formal')) {
          userPrefs.preferences.tone['formal'] += 0.1
          adaptations.push('Strengthened preference for formal tone')
        } else if (aspect.includes('conversational')) {
          userPrefs.preferences.tone['conversational'] += 0.1
          adaptations.push('Strengthened preference for conversational tone')
        } else if (aspect.includes('enthusiastic')) {
          userPrefs.preferences.tone['enthusiastic'] += 0.1
          adaptations.push('Strengthened preference for enthusiastic tone')
        }
        
        if (aspect.includes('short') || aspect.includes('quick')) {
          userPrefs.preferences.length['short_5-10min'] += 0.1
          adaptations.push('Strengthened preference for shorter episodes')
        } else if (aspect.includes('detailed') || aspect.includes('comprehensive')) {
          userPrefs.preferences.length['long_30-45min'] += 0.1
          adaptations.push('Strengthened preference for longer, detailed episodes')
        }
        
        if (aspect.includes('beginner') || aspect.includes('simple')) {
          userPrefs.preferences.complexity['beginner'] += 0.1
          adaptations.push('Strengthened preference for beginner-level content')
        }
      }
    }
    
    // Process disliked aspects (weaken or flip preferences)
    if (feedback.aspects.disliked) {
      for (const aspect of feedback.aspects.disliked) {
        if (aspect.includes('formal')) {
          userPrefs.preferences.tone['formal'] = Math.max(0, userPrefs.preferences.tone['formal'] - 0.1)
          adaptations.push('Reduced preference for formal tone based on negative feedback')
        } else if (aspect.includes('enthusiastic')) {
          userPrefs.preferences.tone['enthusiastic'] = Math.max(0, userPrefs.preferences.tone['enthusiastic'] - 0.1)
          adaptations.push('Reduced preference for enthusiastic tone based on negative feedback')
        }
        
        if (aspect.includes('too long')) {
          userPrefs.preferences.length['short_5-10min'] += 0.1
          adaptations.push('Shifted preference towards shorter episodes')
        }
        
        if (aspect.includes('too short') || aspect.includes('rushed')) {
          userPrefs.preferences.length['long_30-45min'] += 0.1
          adaptations.push('Shifted preference towards longer episodes')
        }
      }
    }
    
    // Normalize preferences (sum to 1.0)
    const toneSum = Object.values(userPrefs.preferences.tone).reduce((a, b) => a + b, 0)
    const lengthSum = Object.values(userPrefs.preferences.length).reduce((a, b) => a + b, 0)
    const complexitySum = Object.values(userPrefs.preferences.complexity).reduce((a, b) => a + b, 0)
    
    if (toneSum > 0) {
      Object.keys(userPrefs.preferences.tone).forEach(key => {
        userPrefs.preferences.tone[key as keyof PreferenceModel['tone']] /= toneSum
      })
    }
    
    if (lengthSum > 0) {
      Object.keys(userPrefs.preferences.length).forEach(key => {
        userPrefs.preferences.length[key as keyof PreferenceModel['length']] /= lengthSum
      })
    }
    
    if (complexitySum > 0) {
      Object.keys(userPrefs.preferences.complexity).forEach(key => {
        userPrefs.preferences.complexity[key as keyof PreferenceModel['complexity']] /= complexitySum
      })
    }
    
    this.preferences.set(userId, userPrefs)
    
    return adaptations
  }

  /**
   * Update patterns based on feedback
   */
  private updatePatterns(userId: string, patterns: Map<string, number>, feedback: FeedbackData): string[] {
    const userPatterns = this.patterns.get(userId) || this.initializePatterns()
    const updates: string[] = []
    
    // Add new successful patterns
    for (const [key, value] of patterns) {
      if (value > 0 && !userPatterns.successful.scriptApproaches.has(key)) {
        userPatterns.successful.scriptApproaches.set(key, value)
        updates.push(`Added successful pattern: ${key}`)
      }
    }
    
    // Add avoided mistakes
    if (feedback.aspects.disliked) {
      for (const aspect of feedback.aspects.disliked) {
        const count = userPatterns.avoided.mistakes.get(aspect) || 0
        userPatterns.avoided.mistakes.set(aspect, count + 1)
        updates.push(`Added avoided mistake: ${aspect}`)
      }
    }
    
    // Store user-specific feedback
    if (feedback.suggestions) {
      userPatterns.userSpecific.set(feedback.suggestions, true)
      updates.push(`Stored user suggestion: ${feedback.suggestions}`)
    }
    
    this.patterns.set(userId, userPatterns)
    
    return updates
  }

  /**
   * Recalculate weights based on performance
   */
  private recalculateWeights(userId: string, feedback: FeedbackData): string[] {
    const userMetrics = this.metrics.get(userId)
    const updates: string[] = []
    
    if (!userMetrics) {
      return updates
    }
    
    // Increase weight for areas performing well
    if (feedback.rating >= 4) {
      this.weights.qualityScoring *= 1.05
      updates.push('Increased weight for quality scoring (positive feedback)')
    } else if (feedback.rating <= 2) {
      this.weights.qualityScoring *= 0.95
      updates.push('Decreased weight for quality scoring (negative feedback)')
    }
    
    // Adjust personalization weight based on feedback consistency
    const feedbackHistory = this.getRecentFeedbackHistory(userId, 10)
    const avgRating = feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / feedbackHistory.length
    
    if (avgRating >= 4) {
      this.weights.personalization = Math.min(1.0, this.weights.personalization + 0.05)
      updates.push('Increased personalization weight (consistently positive feedback)')
    } else if (avgRating <= 2) {
      this.weights.personalization = Math.max(0.6, this.weights.personalization - 0.05)
      updates.push('Decreased personalization weight (consistently negative feedback)')
    }
    
    return updates
  }

  /**
   * Generate adaptive suggestions based on feedback
   */
  private generateAdaptiveSuggestions(userId: string, feedback: FeedbackData): string[] {
    const suggestions: string[] = []
    const userPrefs = this.preferences.get(userId)
    
    if (!userPrefs) {
      return suggestions
    }
    
    // Suggest based on strongest preferences
    const strongestTone = Object.entries(userPrefs.preferences.tone)
      .sort(([, a], [, b]) => b - a)[0]
    
    if (strongestTone[1] > 0.3) {
      suggestions.push(`Continue using ${strongestTone[0]} tone in your scripts`)
    }
    
    const strongestLength = Object.entries(userPrefs.preferences.length)
      .sort(([, a], [, b]) => b - a)[0]
    
    if (strongestLength[1] > 0.3) {
      const duration = strongestLength[0].replace('_', '-').replace('min', ' minutes')
      suggestions.push(`Continue creating ${duration} episodes as you prefer`)
    }
    
    return suggestions
  }

  /**
   * Calculate confidence in feedback and adaptations
   */
  private calculateConfidence(feedback: FeedbackData, patterns: Map<string, number>): number {
    let confidence = 0.7 // Base confidence
    
    // Increase confidence for detailed feedback
    if (feedback.aspects && (feedback.aspects.liked?.length || 0) + (feedback.aspects.disliked?.length || 0) > 0) {
      confidence += 0.1
    }
    
    // Increase confidence for suggestions provided
    if (feedback.suggestions) {
      confidence += 0.1
    }
    
    // Increase confidence for high ratings
    if (feedback.rating >= 4) {
      confidence += 0.05
    } else if (feedback.rating <= 2) {
      confidence -= 0.05
    }
    
    return Math.min(confidence, 0.95)
  }

  /**
   * Get recent feedback history for analysis
   */
  private getRecentFeedbackHistory(userId: string, limit: number): FeedbackData[] {
    // This would retrieve from database
    // For now, return empty array
    return []
  }

  /**
   * Initialize default preferences
   */
  private initializePreferences(): PreferenceModel {
    return {
      tone: {
        formal: 0.25,
        conversational: 0.25,
        enthusiatic: 0.25,
        serious: 0.25,
        humorous: 0.0
      },
      length: {
        short_5_10min: 0.33,
        medium_15_20min: 0.33,
        long_30_45min: 0.33
      },
      complexity: {
        beginner: 0.33,
        intermediate: 0.33,
        advanced: 0.33
      },
      structure: {
        intro_main_conclusion: 0.5,
        multiple_segments: 0.25,
        continuous_flow: 0.25
      },
      topics: {
        technical: 0.25,
        educational: 0.25,
        entertainment: 0.25,
        news: 0.25
      }
    }
  }

  /**
   * Initialize default patterns
   */
  private initializePatterns(): PatternModel {
    return {
      successful: {
        scriptApproaches: new Map(),
        audioApproaches: new Map(),
        structureApproaches: new Map(),
        toneApproaches: new Map()
      },
      avoided: {
        mistakes: new Map(),
        topics: new Map(),
        structures: new Map()
      },
      userSpecific: new Map()
    }
  }

  /**
   * Get personalized generation parameters
   */
  getPersonalizedParameters(userId: string): {
    tone: string
    length: number
    complexity: string
    structure: string
    topics: string[]
  } {
    const userPrefs = this.preferences.get(userId) || this.initializePreferences()
    
    // Determine strongest preferences
    const strongestTone = Object.entries(userPrefs.preferences.tone)
      .sort(([, a], [, b]) => b - a)[0]
    
    const strongestLength = Object.entries(userPrefs.preferences.length)
      .sort(([, a], [, b]) => b - a)[0]
    
    const strongestComplexity = Object.entries(userPrefs.preferences.complexity)
      .sort(([, a], [, b]) => b - a)[0]
    
    const strongestStructure = Object.entries(userPrefs.preferences.structure)
      .sort(([, a], [, b]) => b - a)[0]
    
    const strongestTopics = Object.entries(userPrefs.preferences.topics)
      .filter(([, value]) => value > 0.2)
      .map(([key]) => key)
    
    return {
      tone: strongestTone[0],
      length: this.convertLengthToMinutes(strongestLength[0]),
      complexity: strongestComplexity[0],
      structure: strongestStructure[0],
      topics: strongestTopics
    }
  }

  /**
   * Convert length preference to minutes
   */
  private convertLengthToMinutes(lengthKey: string): number {
    const mapping = {
      short_5_10min: 7.5,
      medium_15_20min: 17.5,
      long_30_45min: 37.5
    }
    
    return mapping[lengthKey as keyof typeof mapping] || 15
  }

  /**
   * Get improvement metrics for a user
   */
  getImprovementMetrics(userId: string, projectId: string): ImprovementMetrics | null {
    return this.metrics.get(userId) || null
  }

  /**
   * Export current state for persistence
   */
  exportState(): {
    metrics: Record<string, ImprovementMetrics>
    preferences: Record<string, PreferenceModel>
    patterns: Record<string, PatternModel>
    weights: WeightModel
  } {
    const metricsExport: Record<string, ImprovementMetrics> = {}
    const prefsExport: Record<string, PreferenceModel> = {}
    const patternsExport: Record<string, PatternModel> = {}
    
    for (const [userId, metrics] of this.metrics.entries()) {
      metricsExport[userId] = metrics
    }
    
    for (const [userId, prefs] of this.preferences.entries()) {
      prefsExport[userId] = prefs
    }
    
    for (const [userId, patterns] of this.patterns.entries()) {
      patternsExport[userId] = patterns
    }
    
    return {
      metrics: metricsExport,
      preferences: prefsExport,
      patterns: patternsExport,
      weights: this.weights
    }
  }

  /**
   * Import state from persistence
   */
  importState(state: {
    metrics?: Record<string, ImprovementMetrics>
    preferences?: Record<string, PreferenceModel>
    patterns?: Record<string, PatternModel>
    weights?: WeightModel
  }): void {
    if (state.metrics) {
      for (const [userId, metrics] of Object.entries(state.metrics)) {
        this.metrics.set(userId, metrics)
      }
    }
    
    if (state.preferences) {
      for (const [userId, prefs] of Object.entries(state.preferences)) {
        this.preferences.set(userId, prefs)
      }
    }
    
    if (state.patterns) {
      for (const [userId, patterns] of Object.entries(state.patterns)) {
        this.patterns.set(userId, patterns)
      }
    }
    
    if (state.weights) {
      this.weights = state.weights
    }
    
    console.log('[Self-Improving] Imported state:', {
      users: this.metrics.size,
      preferences: this.preferences.size,
      patterns: this.patterns.size
    })
  }
}

// Create singleton instance
export const selfImprovingSystem = new SelfImprovingSystem()

// Export functions for easy use
export const {
  processFeedback,
  getPersonalizedParameters,
  getImprovementMetrics,
  exportState,
  importState
} = selfImprovingSystem
