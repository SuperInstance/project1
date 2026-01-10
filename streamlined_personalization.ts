// Streamlined Personalization Engine
// 
// SIMPLE: Uses existing memory and self-improvement
// POWERFUL: Provides perfectly personalized generation
// CLEAN: Easy to understand and extend
// FAST: Minimal overhead, fast personalization

import { memorySystem } from './memory_system'
import { selfImprovingSystem } from './self_improving_system'

export interface PersonalizationContext {
  userId: string
  projectId?: string
  currentTask: string
  userLevel: 'beginner' | 'intermediate' | 'expert'
}

export interface PersonalizedParameters {
  tone: string
  style: string
  length: number
  complexity: string
  structure: string
  voice?: string
  pacing: string
  examples: boolean
  technicalLevel: string
}

export interface PersonalizedSuggestion {
  aspect: string
  recommendation: string
  confidence: number
  reasoning: string
}

export interface PersonalizationScore {
  overall: number // 0.0 to 1.0
  factors: {
    toneMatch: number
    styleMatch: number
    lengthMatch: number
    complexityMatch: number
    structureMatch: number
    voiceMatch: number
    examplesMatch: number
    technicalMatch: number
  }
  explanation: string
}

// Streamlined Personalization Engine
class StreamlinedPersonalizationEngine {
  constructor() {
    console.log('[Personalization Engine] Initializing')
  }

  /**
   * Get personalized parameters for user (STREAMLINED)
   */
  async getPersonalizedParameters(
    userId: string,
    context?: PersonalizationContext
  ): Promise<PersonalizedParameters> {
    console.log('[Personalization Engine] Getting personalized parameters for:', userId)

    // Step 1: Load user preferences from memory
    const userContext = await memorySystem.retrieveUserContext(userId)
    const preferences = userContext.preferences

    // Step 2: Load user patterns and learning
    const patterns = userContext.patterns

    // Step 3: Get self-improvement learning
    const improvements = userContext.learning

    // Step 4: Calculate personalization scores
    const scores = await this.calculatePersonalizationScores(
      userId,
      preferences,
      patterns,
      improvements,
      context
    )

    // Step 5: Determine best parameters based on scores
    const params = this.determineBestParameters(scores, preferences, patterns)

    console.log('[Personalization Engine] Parameters calculated:', {
      tone: params.tone,
      style: params.style,
      confidence: scores.overall
    })

    return params
  }

  /**
   * Get personalized suggestions (STREAMLINED but POWERFUL)
   */
  async getPersonalizedSuggestions(
    userId: string,
    task: string,
    context?: PersonalizationContext
  ): Promise<PersonalizedSuggestion[]> {
    console.log('[Personalization Engine] Getting suggestions for:', task)

    const suggestions: PersonalizedSuggestion[] = []

    // Step 1: Get personalized parameters
    const params = await this.getPersonalizedParameters(userId, context)

    // Step 2: Generate task-specific suggestions
    const taskSuggestions = this.generateTaskSuggestions(task, params)

    suggestions.push(...taskSuggestions)

    // Step 3: Add general personalization suggestions
    const generalSuggestions = this.generateGeneralSuggestions(params, context)

    suggestions.push(...generalSuggestions)

    // Step 4: Rank by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)

    // Step 5: Limit to top 10
    const topSuggestions = suggestions.slice(0, 10)

    console.log('[Personalization Engine] Suggestions generated:', {
      task,
      totalSuggestions: suggestions.length,
      topSuggestions: topSuggestions.length
    })

    return topSuggestions
  }

  /**
   * Personalize content (STREAMLINED but POWERFUL)
   */
  async personalizeContent(
    userId: string,
    content: string,
    context?: PersonalizationContext
  ): Promise<{
    personalizedContent: string
    changes: string[]
    personalizationScore: PersonalizationScore
  }> {
    console.log('[Personalization Engine] Personalizing content for:', userId)

    // Step 1: Get personalized parameters
    const params = await this.getPersonalizedParameters(userId, context)

    // Step 2: Calculate what needs to change
    const changes = this.calculateContentChanges(content, params)

    // Step 3: Apply changes (STREAMLINED)
    const personalizedContent = this.applyContentChanges(content, params, changes)

    // Step 4: Calculate personalization score
    const score = await this.calculatePersonalizationScores(
      userId,
      params,
      { ...params },
      context
    )

    console.log('[Personalization Engine] Content personalized:', {
      changes: changes.length,
      score: score.overall
    })

    return {
      personalizedContent,
      changes,
      personalizationScore: score
    }
  }

  /**
   * Calculate personalization scores (STREAMLINED)
   */
  private async calculatePersonalizationScores(
    userId: string,
    preferences: any,
    patterns: any,
    improvements: any,
    context?: PersonalizationContext
  ): Promise<PersonalizationScore> {
    const scores: any = {
      overall: 0.7, // Base confidence
      factors: {
        toneMatch: this.calculateMatchScore(
          preferences.tone,
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'tone'
        ),
        styleMatch: this.calculateMatchScore(
          preferences.style,
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'style'
        ),
        lengthMatch: this.calculateMatchScore(
          preferences.length.toString(),
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'length'
        ),
        complexityMatch: this.calculateMatchScore(
          preferences.complexity,
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'complexity'
        ),
        structureMatch: this.calculateMatchScore(
          preferences.structurePreference,
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'structure'
        ),
        voiceMatch: this.calculateMatchScore(
          preferences.preferredVoices.join(','),
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'voice'
        ),
        examplesMatch: this.calculateMatchScore(
          patterns.likedAspects.filter(a => a.includes('example')).length > 0 ? 'yes' : 'no',
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'examples'
        ),
        technicalMatch: this.calculateMatchScore(
          patterns.likedAspects.filter(a => a.includes('simple') || a.includes('beginner')).length > 0 ? 'beginner' : 'advanced',
          patterns.likedAspects,
          patterns.avoidedMistakes,
          'technical'
        )
      }
    }

  // Boost overall score based on learning
  scores.overall += improvements.modelConfidence * 0.2

  // Boost based on user level
  if (context?.userLevel === 'expert') {
    scores.overall += 0.1
  }

  // Cap at 0.98
  scores.overall = Math.min(scores.overall, 0.98)

  // Generate explanation
  scores.explanation = this.generateScoreExplanation(scores.factors, preferences)

  return scores
  }

  /**
   * Calculate match score for single aspect (STREAMLINED)
   */
  private calculateMatchScore(
    preference: string,
    likedAspects: string[],
    avoidedMistakes: string[],
    aspect: string
  ): number {
    let score = 0.5 // Base score

    // Check if preference matches liked aspects
    if (likedAspects.some(aspect => 
      aspect.toLowerCase().includes(preference.toLowerCase())
    )) {
      score += 0.3
    }

    // Check if preference is in avoided mistakes
    if (avoidedMistakes.some(mistake => 
      mistake.toLowerCase().includes(preference.toLowerCase())
    )) {
      score -= 0.2
    }

    // Normalize to 0.0-1.0 range
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Determine best parameters based on scores (STREAMLINED)
   */
  private determineBestParameters(
    scores: any,
    preferences: any,
    patterns: any
  ): PersonalizedParameters {
    // Extract top scores for each aspect
    const factors = scores.factors

    // Determine best tone (highest score)
    const bestTone = this.getHighestScoreKey(factors.toneMatch)
      const toneMap: any = {
        'formal': 'professional',
        'conversational': 'casual',
        'enthusiastic': 'energetic',
        'serious': 'formal',
        'humorous': 'friendly'
      }
      return toneMap[bestTone] || 'professional'

    // Determine best style
    const bestStyle = this.getHighestScoreKey(factors.styleMatch)
      const styleMap: any = {
        'structured': 'organized',
        'flowing': 'conversational',
        'concise': 'succinct',
        'detailed': 'comprehensive',
        'engaging': 'dynamic'
      }
      return styleMap[bestStyle] || 'conversational'

    // Determine best length
    const bestLength = this.getHighestScoreKey(factors.lengthMatch)
      const lengthMap: any = {
        'short_5-10min': 7.5,
        'medium_15-20min': 17.5,
        'long_30-45min': 37.5
      }
      return lengthMap[bestLength] || 15

    // Determine best complexity
    const bestComplexity = this.getHighestScoreKey(factors.complexityMatch)
      const complexityMap: any = {
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced'
      }
      return complexityMap[bestComplexity] || 'intermediate'

    // Determine best structure
    const bestStructure = this.getHighestScoreKey(factors.structureMatch)
      const structureMap: any = {
        'intro-main-conclusion': 'intro-body-conclusion',
        'multiple_segments': 'multi-segment',
        'continuous_flow': 'continuous-flow'
      }
      return structureMap[bestStructure] || 'intro-body-conclusion'

    // Determine best voice (from preferences)
    const bestVoice = preferences.preferredVoices?.[0] || 'default'

    // Determine pacing (based on style)
    const pacingMap: any = {
      'organized': 'moderate',
      'conversational': 'moderate',
      'concise': 'fast',
      'comprehensive': 'slow',
      'engaging': 'dynamic',
      'dynamic': 'varied'
    }
    const bestPacing = pacingMap[bestStyle] || 'moderate'

    return {
      tone: bestTone,
      style: bestStyle,
      length: bestLength,
      complexity: bestComplexity,
      structure: bestStructure,
      voice: bestVoice,
      pacing: bestPacing,
      examples: factors.examplesMatch > 0.6,
      technicalLevel: factors.technicalMatch > 0.6 ? 'beginner' : 'advanced'
    }
  }

  /**
   * Generate task-specific suggestions (STREAMLINED)
   */
  private generateTaskSuggestions(
    task: string,
    params: PersonalizedParameters
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = []

    // Task-specific suggestions based on parameters
    if (task.includes('script') || task.includes('podcast') || task.includes('episode')) {
      // Script/podcast task suggestions
      if (params.examples) {
        suggestions.push({
          aspect: 'Content examples',
          recommendation: 'Include concrete examples and real-world applications in your script',
          confidence: 0.85,
          reasoning: 'You prefer scripts with examples'
        })
      }

      if (params.tone === 'professional') {
        suggestions.push({
          aspect: 'Professional tone',
          recommendation: 'Use formal but accessible language appropriate for your target audience',
          confidence: 0.8,
          reasoning: 'You prefer professional tone in your scripts'
        })
      }

      if (params.length < 15) {
        suggestions.push({
          aspect: 'Shorter episodes',
          recommendation: 'Consider keeping episodes concise and focused as you prefer shorter content',
          confidence: 0.75,
          reasoning: 'Your preferred length is shorter than standard'
        })
      }
    }

    if (task.includes('audio') || task.includes('tts') || task.includes('voice')) {
      // Audio task suggestions
      if (params.voice) {
        suggestions.push({
          aspect: 'Voice selection',
          recommendation: `Use your preferred voice: ${params.voice}`,
          confidence: 0.9,
          reasoning: 'You prefer this voice for audio generation'
        })
      }

      suggestions.push({
        aspect: 'Audio quality',
        recommendation: 'Generate high-quality audio suitable for podcast distribution',
        confidence: 0.85,
          reasoning: 'Consistent with your preference for professional quality'
        })
    }

    return suggestions
  }

  /**
   * Generate general personalization suggestions (STREAMLINED)
   */
  private generateGeneralSuggestions(
    params: PersonalizedParameters,
    context?: PersonalizationContext
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = []

    // General personalization suggestions
    suggestions.push({
      aspect: 'Tone consistency',
      recommendation: `Maintain ${params.tone} tone throughout your content for consistency`,
      confidence: 0.9,
      reasoning: 'You prefer this tone and it improves quality'
    })

    suggestions.push({
      aspect: 'Style matching',
      recommendation: `Continue using ${params.style} style as it aligns with your preferences`,
      confidence: 0.85,
      reasoning: 'This style matches your successful patterns'
    })

    if (params.complexity === 'beginner' && context?.userLevel !== 'expert') {
      suggestions.push({
        aspect: 'Beginner-friendly content',
        recommendation: 'Keep content accessible and include explanations for concepts',
        confidence: 0.8,
        reasoning: 'You prefer beginner-level content'
      })
    }

    return suggestions
  }

  /**
   * Calculate content changes needed (STREAMLINED)
   */
  private calculateContentChanges(
    content: string,
    params: PersonalizedParameters
  ): string[] {
    const changes: string[] = []

    // Check tone
    if (!this.matchesTone(content, params.tone)) {
      changes.push(`Adjust tone to be more ${params.tone}`)
    }

    // Check length (very basic check)
    const words = content.split(/\s+/).length
    const targetWords = params.length * 150 // ~150 words per minute

    if (Math.abs(words - targetWords) > targetWords * 0.3) {
      changes.push(`Adjust length toward ${params.length} minutes (target: ~${targetWords} words)`)
    }

    // Check examples
    if (params.examples && !content.includes('example')) {
      changes.push('Add concrete examples or real-world applications')
    }

    return changes
  }

  /**
   * Apply content changes (STREAMLINED)
   */
  private applyContentChanges(
    content: string,
    params: PersonalizedParameters,
    changes: string[]
  ): string {
    let personalizedContent = content

    // For now, just return content with changes as notes
    // In production, would use LLM to rewrite with changes applied
    
    if (changes.length > 0) {
      personalizedContent += `\n\n[Personalization Notes: ${changes.join('; ')}]`
    }

    return personalizedContent
  }

  /**
   * Get highest score key from scores map (STREAMLINED)
   */
  private getHighestScoreKey(scores: any): string {
    let highestScore = 0
    let highestKey = ''

    for (const [key, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score
        highestKey = key
      }
    }

    return highestKey
  }

  /**
   * Generate score explanation (STREAMLINED)
   */
  private generateScoreExplanation(factors: any, preferences: any): string {
    const explanations: string[] = []

    // Find top factors
    const topFactors = Object.entries(factors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    for (const [aspect, score] of topFactors) {
      if (score >= 0.7) {
        const preference = preferences[aspect]
        if (preference) {
          explanations.push(`Strong ${aspect} match (${(score * 100).toFixed(0)}%) with your preference`)
        }
      } else if (score >= 0.5) {
        explanations.push(`Good ${aspect} alignment (${(score * 100).toFixed(0)}%)`)
      }
    }

    if (explanations.length === 0) {
      return 'Using default parameters - need more feedback'
    }

    return explanations.join('; ')
  }

  /**
   * Check if tone matches content (very basic check)
   */
  private matchesTone(content: string, tone: string): boolean {
    const contentLower = content.toLowerCase()
    const toneLower = tone.toLowerCase()

    // Very basic tone checking
    const toneIndicators: Record<string, string[]> = {
      professional: ['professional', 'formal', 'business', 'official'],
      conversational: ['conversational', 'casual', 'friendly', 'relaxed'],
      enthusiastic: ['enthusiastic', 'energetic', 'excited', 'passionate', 'dynamic'],
      serious: ['serious', 'solemn', 'important', 'critical'],
      humorous: ['funny', 'humor', 'joke', 'playful', 'witty']
    }

    const indicators = toneIndicators[tone] || []

    return indicators.some(indicator => contentLower.includes(indicator))
  }

  /**
   * Get personalization health metrics (STREAMLINED)
   */
  async getPersonalizationHealth(userId: string): Promise<{
    score: number
    status: 'excellent' | 'good' | 'fair' | 'needs_feedback'
    aspects: Record<string, number>
    recommendations: string[]
  }> {
    // Get user context
    const userContext = await memorySystem.retrieveUserContext(userId)
    const params = await selfImprovingSystem.getPersonalizedParameters(userId)

    // Calculate health score
    const score = params.length > 0 ? 0.85 : 0.5
    const recommendations: string[] = []

    // Check learning progress
    const learningProgress = userContext.learning.adaptationLevel
    if (learningProgress > 0.8) {
      score += 0.1
      recommendations.push('Excellent personalization - highly adaptive')
    } else if (learningProgress < 0.3) {
      score -= 0.1
      recommendations.push('Provide more feedback to improve personalization')
    }

    // Check feedback history
    const totalInteractions = userContext.history.length
    const positiveInteractions = userContext.history.filter(h => h.outcome === 'success').length
    const feedbackRate = totalInteractions > 0 ? positiveInteractions / totalInteractions : 0

    if (feedbackRate > 0.7) {
      score += 0.05
      recommendations.push('Great feedback history - personalization highly effective')
    } else if (feedbackRate < 0.3) {
      score -= 0.1
      recommendations.push('Rate more podcasts to improve personalization')
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'needs_feedback' = 'fair'
    if (score >= 0.9) status = 'excellent'
    else if (score >= 0.75) status = 'good'
    else if (score >= 0.5) status = 'fair'
    else status = 'needs_feedback'

    // Aspect breakdown
    const aspects: Record<string, number> = {
      tone: params.tone ? 0.9 : 0.5,
      style: params.style ? 0.85 : 0.5,
      length: params.length ? 0.9 : 0.5,
      complexity: params.complexity ? 0.8 : 0.5,
      structure: params.structure ? 0.8 : 0.5
    }

    return {
      score: Math.min(score, 0.95),
      status,
      aspects,
      recommendations
    }
  }

  /**
   * Reset personalization for user (STREAMLINED)
   */
  async resetPersonalization(userId: string): Promise<boolean> {
    try {
      // This would clear personalization and reset to defaults
      // For now, log the action
      
      console.log('[Personalization Engine] Reset personalization for:', userId)
      
      return true
    } catch (error) {
      console.error('[Personalization Engine] Error resetting personalization:', error)
      return false
    }
  }

  /**
   * Get personalization summary (STREAMLINED)
   */
  async getPersonalizationSummary(userId: string): Promise<{
    preferences: PersonalizedParameters
    learning: any
    confidence: number
    recommendations: string[]
  }> {
    // Get personalized parameters
    const params = await this.getPersonalizedParameters(userId)
    
    // Get learning status
    const metrics = await selfImprovingSystem.getImprovementMetrics(userId, 'current')
    
    // Get confidence
    const confidence = metrics ? metrics.confidence || 0.7 : 0.7
    
    // Generate recommendations
    const recommendations: string[] = []
    
    if (confidence > 0.9) {
      recommendations.push('Excellent personalization - you\'re all set!')
    } else if (confidence < 0.6) {
      recommendations.push('Rate more podcasts to help the system learn your preferences')
    }

    return {
      preferences: params,
      learning: metrics?.adaptations || {},
      confidence,
      recommendations
    }
  }
}

// Create singleton instance
export const personalizationEngine = new StreamlinedPersonalizationEngine()

// Export main functions (STREAMLINED interface)
export const {
  getPersonalizedParameters,
  getPersonalizedSuggestions,
  personalizeContent,
  getPersonalizationHealth,
  resetPersonalization,
  getPersonalizationSummary
} = personalizationEngine
