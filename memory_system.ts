// Long-Term Memory System for Cognitive AI-Native Podcast Maker
// 
// This system provides persistent memory for:
// - User preferences and learning
// - Project content understanding
// - Long-term knowledge storage
// - Cross-session context persistence

export interface UserMemory {
  id: string
  preferences: {
    tone: string
    style: string
    length: number
    complexity: 'beginner' | 'intermediate' | 'advanced'
    preferredVoices: string[]
    structurePreference: string
  }
  patterns: {
    successfulApproaches: string[]
    avoidedMistakes: string[]
    likedAspects: string[]
    dislikedAspects: string[]
  }
  history: InteractionHistory[]
  learning: {
    modelConfidence: number
    adaptationLevel: number
    lastUpdated: string
  }
}

export interface ProjectMemory {
  id: string
  content: {
    themes: string[]
    concepts: string[]
    relationships: string[]
    terminology: string[]
    narratives: string[]
  }
  structure: {
    files: FileMetadata[]
    folders: FolderStructure[]
    dependencies: string[]
    connections: ConnectionMap
  }
  analysis: {
    semanticUnderstanding: string
    complexity: number
    targetAudience: string
    educationalGoals: string[]
  }
  evolution: {
    insights: string[]
    improvements: string[]
    version: number
  }
}

export interface InteractionHistory {
  timestamp: string
  type: 'podcast_created' | 'script_refined' | 'audio_generated' | 'feedback_received' | 'question_asked'
  content: string
  metadata: Record<string, any>
  outcome: 'success' | 'partial' | 'failure'
  userRating?: 'positive' | 'negative' | 'neutral'
}

export interface FileMetadata {
  path: string
  name: string
  type: string
  size: number
  lastModified: string
  contentHash: string
  semantics: {
    topics: string[]
    complexity: number
    relevanceScore: number
  }
}

export interface FolderStructure {
  path: string
  name: string
  children: (FileMetadata | FolderStructure)[]
  metadata: {
    depth: number
    totalFiles: number
    semanticTheme?: string
  }
}

export interface ConnectionMap {
  [key: string]: {
    related: string[]
    type: 'hierarchy' | 'reference' | 'dependency' | 'theme'
    strength: number
  }
}

// In-memory storage (will be persisted to DB in production)
class MemorySystem {
  private userMemory: Map<string, UserMemory> = new Map()
  private projectMemory: Map<string, ProjectMemory> = new Map()
  private globalKnowledge: Map<string, any> = new Map()

  /**
   * Store user interaction
   */
  async storeInteraction(
    userId: string,
    interaction: InteractionHistory
  ): Promise<void> {
    const userMem = this.userMemory.get(userId) || this.createUserMemory(userId)
    
    userMem.history.push(interaction)
    
    // Update patterns based on interaction
    if (interaction.outcome === 'success') {
      userMem.patterns.successfulApproaches.push(interaction.content)
    }
    
    if (interaction.userRating === 'negative') {
      userMem.patterns.avoidedMistakes.push(interaction.content)
    }
    
    if (interaction.userRating === 'positive') {
      userMem.patterns.likedAspects.push(
        interaction.metadata.aspects || []
      )
    }
    
    // Update learning metrics
    userMem.learning.modelConfidence = this.calculateConfidence(userMem)
    userMem.learning.adaptationLevel = this.calculateAdaptation(userMem)
    userMem.learning.lastUpdated = new Date().toISOString()
    
    this.userMemory.set(userId, userMem)
    
    console.log('[Memory System] Stored interaction for user:', userId)
  }

  /**
   * Retrieve user context for personalization
   */
  async retrieveUserContext(userId: string): Promise<UserMemory> {
    return this.userMemory.get(userId) || this.createUserMemory(userId)
  }

  /**
   * Update user preferences from feedback
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserMemory['preferences']>
  ): Promise<void> {
    const userMem = this.userMemory.get(userId)
    if (userMem) {
      Object.assign(userMem.preferences, preferences)
      this.userMemory.set(userId, userMem)
      
      console.log('[Memory System] Updated preferences for user:', userId)
    }
  }

  /**
   * Store project content understanding
   */
  async storeProjectUnderstanding(
    projectId: string,
    understanding: Partial<ProjectMemory['content']> &
             Partial<ProjectMemory['structure']> &
             Partial<ProjectMemory['analysis']>
  ): Promise<void> {
    const projMem = this.projectMemory.get(projectId) || this.createProjectMemory(projectId)
    
    // Merge new understanding
    Object.assign(projMem.content, understanding.content)
    Object.assign(projMem.structure, understanding.structure)
    Object.assign(projMem.analysis, understanding.analysis)
    
    // Update evolution
    projMem.evolution.version++
    projMem.evolution.insights.push('Content understanding updated at ' + new Date().toISOString())
    
    this.projectMemory.set(projectId, projMem)
    
    console.log('[Memory System] Stored project understanding for:', projectId)
  }

  /**
   * Retrieve project context for RAG
   */
  async retrieveProjectContext(projectId: string): Promise<ProjectMemory> {
    return this.projectMemory.get(projectId) || this.createProjectMemory(projectId)
  }

  /**
   * Find patterns across multiple users/projects
   */
  async findCrossUserPatterns(patternType: 'successful_approaches' | 'common_mistakes'): Promise<string[]> {
    const patterns: string[] = []
    
    for (const userMem of this.userMemory.values()) {
      if (patternType === 'successful_approaches') {
        patterns.push(...userMem.patterns.successfulApproaches)
      } else if (patternType === 'common_mistakes') {
        patterns.push(...userMem.patterns.avoidedMistakes)
      }
    }
    
    // Remove duplicates and limit to top 10
    const uniquePatterns = [...new Set(patterns)]
    return uniquePatterns.slice(0, 10)
  }

  /**
   * Connect related concepts across projects
   */
  async connectConcepts(concept: string): Promise<string[]> {
    const connections: string[] = []
    
    // Search through all project memories
    for (const projMem of this.projectMemory.values()) {
      // Check if concept appears in themes
      if (projMem.content.themes.some(theme => 
        theme.toLowerCase().includes(concept.toLowerCase())
      )) {
        connections.push(projMem.id)
      }
      
      // Check if concept appears in narratives
      for (const narrative of projMem.content.narratives) {
        if (narrative.toLowerCase().includes(concept.toLowerCase())) {
          connections.push(projMem.id)
          break
        }
      }
    }
    
    // Remove duplicates
    const uniqueConnections = [...new Set(connections)]
    return uniqueConnections
  }

  /**
   * Store global knowledge across all projects
   */
  async storeKnowledge(
    key: string,
    value: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.globalKnowledge.set(key, {
      value,
      metadata: {
        timestamp: new Date().toISOString(),
        usageCount: 0,
        ...metadata
      }
    })
    
    console.log('[Memory System] Stored knowledge:', key)
  }

  /**
   * Retrieve knowledge with usage tracking
   */
  async retrieveKnowledge(key: string): Promise<any> {
    const knowledge = this.globalKnowledge.get(key)
    
    if (knowledge) {
      // Update usage count
      knowledge.metadata.usageCount++
      this.globalKnowledge.set(key, knowledge)
    }
    
    return knowledge?.value
  }

  /**
   * Get adaptive suggestions based on user history
   */
  async getAdaptiveSuggestions(
    userId: string,
    context: string
  ): Promise<{
    suggestions: string[]
    confidence: number
    reasoning: string
  }> {
    const userMem = await this.retrieveUserContext(userId)
    
    const suggestions: string[] = []
    let confidence = 0.5 // Base confidence
    
    // Suggest based on successful patterns
    for (const approach of userMem.patterns.successfulApproaches) {
      if (this.isRelevantToContext(approach, context)) {
        suggestions.push('Consider this successful approach: ' + approach)
        confidence += 0.1
      }
    }
    
    // Warn about avoided mistakes
    for (const mistake of userMem.patterns.avoidedMistakes) {
      if (this.isRelevantToContext(mistake, context)) {
        suggestions.push('Avoid this mistake: ' + mistake)
        confidence += 0.05
      }
    }
    
    // Suggest based on preferences
    if (userMem.preferences.tone) {
      suggestions.push(`Match your preferred tone: ${userMem.preferences.tone}`)
      confidence += 0.1
    }
    
    if (userMem.preferences.length) {
      suggestions.push(`Target ${userMem.preferences.length} minutes as you prefer`)
      confidence += 0.05
    }
    
    // Limit suggestions and cap confidence
    const finalSuggestions = suggestions.slice(0, 5)
    const finalConfidence = Math.min(confidence, 0.95)
    
    return {
      suggestions: finalSuggestions,
      confidence: finalConfidence,
      reasoning: `Based on your ${userMem.patterns.successfulApproaches.length} successful approaches and ${userMem.history.length} total interactions`
    }
  }

  /**
   * Calculate model confidence based on user history
   */
  private calculateConfidence(userMem: UserMemory): number {
    const successfulRate = userMem.history.filter(h => h.outcome === 'success').length / userMem.history.length
    const adaptationScore = userMem.learning.adaptationLevel
    
    // Base confidence + success rate + adaptation
    return 0.6 + (successfulRate * 0.3) + (adaptationScore * 0.1)
  }

  /**
   * Calculate adaptation level based on learning
   */
  private calculateAdaptation(userMem: UserMemory): number {
    const interactionCount = userMem.history.length
    const uniqueApproaches = new Set(userMem.patterns.successfulApproaches).size
    
    // Adaptation increases with more interactions and diversity
    return Math.min((interactionCount / 100) + (uniqueApproaches / 20), 1.0)
  }

  /**
   * Check if content is relevant to context
   */
  private isRelevantToContext(content: string, context: string): boolean {
    const contentLower = content.toLowerCase()
    const contextLower = context.toLowerCase()
    
    // Simple keyword matching
    const contextKeywords = contextLower.split(' ').filter(w => w.length > 3)
    
    return contextKeywords.some(keyword => contentLower.includes(keyword))
  }

  /**
   * Create initial user memory
   */
  private createUserMemory(userId: string): UserMemory {
    return {
      id: userId,
      preferences: {
        tone: 'professional',
        style: 'conversational',
        length: 20,
        complexity: 'intermediate',
        preferredVoices: ['tongtong', 'xiaochen'],
        structurePreference: 'intro-main-conclusion'
      },
      patterns: {
        successfulApproaches: [],
        avoidedMistakes: [],
        likedAspects: [],
        dislikedAspects: []
      },
      history: [],
      learning: {
        modelConfidence: 0.6,
        adaptationLevel: 0.1,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  /**
   * Create initial project memory
   */
  private createProjectMemory(projectId: string): ProjectMemory {
    return {
      id: projectId,
      content: {
        themes: [],
        concepts: [],
        relationships: [],
        terminology: [],
        narratives: []
      },
      structure: {
        files: [],
        folders: [],
        dependencies: [],
        connections: {}
      },
      analysis: {
        semanticUnderstanding: '',
        complexity: 0,
        targetAudience: 'general',
        educationalGoals: []
      },
      evolution: {
        insights: [],
        improvements: [],
        version: 1
      }
    }
  }

  /**
   * Export memory state for persistence
   */
  exportState(): {
    userMemory: Record<string, UserMemory>
    projectMemory: Record<string, ProjectMemory>
    globalKnowledge: Record<string, any>
  } {
    return {
      userMemory: Object.fromEntries(this.userMemory),
      projectMemory: Object.fromEntries(this.projectMemory),
      globalKnowledge: Object.fromEntries(this.globalKnowledge)
    }
  }

  /**
   * Import memory state from persistence
   */
  importState(state: {
    userMemory?: Record<string, UserMemory>
    projectMemory?: Record<string, ProjectMemory>
    globalKnowledge?: Record<string, any>
  }): void {
    if (state.userMemory) {
      this.userMemory = new Map(Object.entries(state.userMemory))
    }
    if (state.projectMemory) {
      this.projectMemory = new Map(Object.entries(state.projectMemory))
    }
    if (state.globalKnowledge) {
      this.globalKnowledge = new Map(Object.entries(state.globalKnowledge))
    }
    
    console.log('[Memory System] Imported state:', {
      users: this.userMemory.size,
      projects: this.projectMemory.size,
      knowledge: this.globalKnowledge.size
    })
  }
}

// Create singleton instance
export const memorySystem = new MemorySystem()

// Export functions for easy import
export const {
  storeInteraction,
  retrieveUserContext,
  updateUserPreferences,
  storeProjectUnderstanding,
  retrieveProjectContext,
  findCrossUserPatterns,
  connectConcepts,
  storeKnowledge,
  retrieveKnowledge,
  getAdaptiveSuggestions,
  exportState,
  importState
} = memorySystem
