// Deep Content Understanding System for Cognitive AI-Native Podcast Maker
// 
// Scans and deeply analyzes all files in project folder
// Extracts semantic meaning, themes, and relationships
// Builds knowledge graph of connected concepts
// Provides actionable insights for podcast creation

export interface ContentAnalysis {
  filePath: string
  fileName: string
  fileType: string
  size: number
  lastModified: string
  semantics: {
    themes: string[]
    concepts: string[]
    topics: string[]
    complexity: 'beginner' | 'intermediate' | 'advanced'
    educationalLevel: string
    targetAudience: string
  }
  structure: {
    sections: string[]
    hierarchy: string[]
    relationships: string[]
  }
  narrative: {
    style: string
    tone: string
    pacing: string
    voice: string
    examples: string[]
    stories: string[]
  }
  metadata: {
    author?: string
    version?: string
    tags: string[]
    categories: string[]
    lastAnalyzed: string
    relevanceScore: number
  }
}

export interface ProjectAnalysis {
  projectPath: string
  totalFiles: number
  totalSize: number
  fileTypes: Map<string, number>
  themes: string[]
  concepts: string[]
  relationships: ConnectionMap
  complexity: number
  targetAudience: string
  educationalGoals: string[]
  recommendedStructure: string
  suggestedEpisodes: EpisodeSuggestion[]
  gaps: string[]
  opportunities: string[]
}

export interface EpisodeSuggestion {
  title: string
  description: string
  duration: number
  mainTopics: string[]
  keyTakeaways: string[]
  complexity: string
  suggestedSegments: string[]
  visualAids: string[]
}

export interface ConnectionMap {
  [key: string]: {
    related: string[]
    type: 'hierarchy' | 'reference' | 'dependency' | 'theme'
    strength: number
  }
}

export interface AnalysisProgress {
  currentFile: string
  processedFiles: number
  totalFiles: number
  percentage: number
  estimatedTimeRemaining: string
}

// Deep Content Analyzer
class DeepContentAnalyzer {
  private analysis: Map<string, ContentAnalysis> = new Map()
  private projectAnalysis: ProjectAnalysis | null = null
  private knowledgeGraph: Map<string, any> = new Map()

  /**
   * Scan entire project folder recursively
   * 
   * @param projectPath - Root path of project folder
   * @param includeHidden - Whether to include hidden files (default: false)
   * @param maxDepth - Maximum directory depth (default: 5)
   * @param extensions - File extensions to analyze (default: all)
   * @returns File list with metadata
   */
  async scanProjectFolder(
    projectPath: string,
    options: {
      includeHidden?: boolean
      maxDepth?: number
      extensions?: string[]
      excludePatterns?: string[]
    } = {}
  ): Promise<{
    success: boolean
    files: Array<{
      path: string
      name: string
      type: string
      size: number
      lastModified: string
    }>
    directories: string[]
    totalSize: number
  }> {
    const {
      includeHidden = false,
      maxDepth = 5,
      extensions = [],
      excludePatterns = ['node_modules', '.next', '.git', 'dist', 'build', '.DS_Store']
    } = options

    console.log('[Deep Content Analyzer] Scanning project folder:', projectPath)
    console.log('[Deep Content Analyzer] Options:', { includeHidden, maxDepth, extensions, excludePatterns })

    const files: Array<{ path: string; name: string; type: string; size: number; lastModified: string }> = []
    const directories: string[] = []
    let totalSize = 0

    // Recursively scan directory
    const startTime = Date.now()
    await this.scanDirectoryRecursive(projectPath, 0, maxDepth, {
      includeHidden,
      extensions,
      excludePatterns,
      onFile: (file) => {
        totalSize += file.size
        files.push(file)
      },
      onDirectory: (dir) => {
        directories.push(dir)
      }
    })

    const scanTime = Date.now() - startTime
    console.log('[Deep Content Analyzer] Scan complete:', { 
      filesFound: files.length, 
      directoriesFound: directories.length,
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      scanTime: `${scanTime}ms`
    })

    return {
      success: true,
      files,
      directories,
      totalSize
    }
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectoryRecursive(
    dirPath: string,
    currentDepth: number,
    maxDepth: number,
    options: any,
    callbacks: {
      onFile: (file: any) => void
      onDirectory: (dir: string) => void
    }
  ): Promise<void> {
    if (currentDepth > maxDepth) {
      return
    }

    const dir = await opendir(dirPath)

    for await (const entry of dir) {
      const fullPath = path.join(dirPath, entry.name)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        // Check exclude patterns
        const shouldExclude = options.excludePatterns.some((pattern: string) => 
          entry.name.includes(pattern)
        )

        if (!shouldExclude) {
          callbacks.onDirectory({
            path: fullPath,
            name: entry.name,
            type: 'directory',
            size: 0,
            lastModified: stats.mtime.toISOString()
          })
        }
      } else if (stats.isFile()) {
        // Check file extension filter
        const ext = path.extname(entry.name).toLowerCase()
        const shouldInclude = options.extensions.length === 0 || 
          options.extensions.includes(ext)

        if (shouldInclude) {
          callbacks.onFile({
            path: fullPath,
            name: entry.name,
            type: ext.substring(1),
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          })
        }
      }
    }

    dir.close()
  }

  /**
   * Analyze file content deeply
   * 
   * @param filePath - Path to file to analyze
   * @returns Deep semantic analysis of file
   */
  async analyzeFile(filePath: string): Promise<ContentAnalysis> {
    console.log('[Deep Content Analyzer] Analyzing file:', filePath)

    try {
      const content = await readFile(filePath, 'utf-8')
      const ext = path.extname(filePath).toLowerCase()
      const fileName = path.basename(filePath)
      const stats = await stat(filePath)

      // Extract semantic meaning based on file type
      const analysis = await this.extractSemantics(content, ext, fileName)
      
      // Identify narrative structure
      const narrative = this.extractNarrativeStructure(content, ext)
      
      // Extract metadata
      const metadata = this.extractMetadata(content, fileName, ext)

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(analysis, metadata)

      const contentAnalysis: ContentAnalysis = {
        filePath,
        fileName,
        fileType: ext.substring(1),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        semantics: analysis.semantics,
        structure: analysis.structure,
        narrative: analysis.narrative,
        metadata: {
          ...metadata,
          lastAnalyzed: new Date().toISOString(),
          relevanceScore
        }
      }

      console.log('[Deep Content Analyzer] File analysis complete:', {
        fileName,
        themes: analysis.semantics.themes.length,
        concepts: analysis.semantics.concepts.length
        complexity: analysis.semantics.complexity
      })

      return contentAnalysis

    } catch (error) {
      console.error('[Deep Content Analyzer] Error analyzing file:', filePath, error)

      return {
        filePath,
        fileName: path.basename(filePath),
        fileType: path.extname(filePath).substring(1),
        size: 0,
        lastModified: new Date().toISOString(),
        semantics: {
          themes: [],
          concepts: [],
          topics: [],
          complexity: 'beginner',
          educationalLevel: 'unknown',
          targetAudience: 'unknown'
        },
        structure: {
          sections: [],
          hierarchy: [],
          relationships: []
        },
        narrative: {
          style: 'unknown',
          tone: 'unknown',
          pacing: 'unknown',
          voice: 'unknown',
          examples: [],
          stories: []
        },
        metadata: {
          lastAnalyzed: new Date().toISOString(),
          relevanceScore: 0.5
        }
      }
    }
  }

  /**
   * Extract semantic meaning from content
   */
  private async extractSemantics(content: string, fileType: string, fileName: string): Promise<any> {
    // This would use LLM to extract semantic meaning
    // For now, return a mock semantic extraction
    
    const semanticAnalysis = {
      themes: this.extractThemes(content),
      concepts: this.extractConcepts(content, fileType),
      topics: this.extractTopics(content),
      complexity: this.assessComplexity(content, fileType),
      educationalLevel: this.assessEducationalLevel(content),
      targetAudience: this.inferTargetAudience(content)
    }

    return {
      semantics: semanticAnalysis
    }
  }

  /**
   * Extract themes from content
   */
  private extractThemes(content: string): string[] {
    const themes: string[] = []
    const themePatterns = [
      /main theme[s]?:\s*(.+?)/gi,
      /key topic[s]?:\s*(.+?)/gi,
      /central idea[s]?:\s*(.+?)/gi,
      /primary focu[s]?\s*(.+?)/gi,
      /core concept[s]?\s*(.+?)/gi,
      /overarching narrative[s]?\s*(.+?)/gi
    ]

    for (const pattern of themePatterns) {
      const matches = content.matchAll(pattern)
      if (matches) {
        matches.forEach(match => {
          const theme = match[1].trim()
          if (theme.length > 3 && !themes.includes(theme)) {
            themes.push(theme)
          }
        })
      }
    }

    // Also extract from headings
    const headingPattern = /^#+\s+(.+)$/gm
    const headingMatches = content.matchAll(headingPattern)
    if (headingMatches) {
      headingMatches.forEach(match => {
        const heading = match[1].trim()
        if (heading.length > 3 && !themes.includes(heading)) {
          themes.push(heading)
        }
      })
    }

    return themes.slice(0, 10) // Limit to top 10 themes
  }

  /**
   * Extract concepts from content
   */
  private extractConcepts(content: string, fileType: string): string[] {
    const concepts: string[] = []
    
    // Technical terms
    const technicalTerms = this.extractTechnicalTerms(content)
    concepts.push(...technicalTerms)
    
    // Domain-specific terms
    const domainTerms = this.extractDomainTerms(content, fileType)
    concepts.push(...domainTerms)
    
    // Key terms and phrases
    const keyPhrases = this.extractKeyPhrases(content)
    concepts.push(...keyPhrases)

    // Remove duplicates and limit
    const uniqueConcepts = [...new Set(concepts)]
    return uniqueConcepts.slice(0, 20)
  }

  /**
   * Extract topics from content
   */
  private extractTopics(content: string): string[] {
    const topics: string[] = []
    
    // Look for section headers
    const sectionPattern = /^(?:\d+\.)?\s*#+\s+(.+)$/gm
    const sectionMatches = content.matchAll(sectionPattern)
    if (sectionMatches) {
      sectionMatches.forEach(match => {
        const section = match[2].trim()
        if (section.length > 3 && section.length < 50) {
          topics.push(section)
        }
      })
    }

    // Look for topic indicators
    const topicIndicators = [
      /(?:in|about|discussing)\s+(.+?)(?:\s+(?:and|with)\s+(.+?))?/gi,
      /(?:topic|subject|focus)\s*:\s*(.+?)/gi,
      /(?:the|a)\s+(?:topic|subject)\s+(?:of|for)\s+(.+?)/gi
    ]

    for (const pattern of topicIndicators) {
      const matches = content.matchAll(pattern)
      if (matches) {
        matches.forEach(match => {
          const topic = match[1].trim()
          if (topic.length > 2 && !topics.includes(topic)) {
            topics.push(topic)
          }
        })
      }
    }

    const uniqueTopics = [...new Set(topics)]
    return uniqueTopics.slice(0, 10)
  }

  /**
   * Extract technical terms
   */
  private extractTechnicalTerms(content: string): string[] {
    const technicalPatterns = [
      /\b[A-Z][a-z]{2,6}\b/g, // Acronyms (API, REST, etc.)
      /[A-Z]{2,}(?:[A-Z]+)?\b/g, // CamelCase words
      /\b[a-z]+(?:tion|ing|ism|ability|ity)\b/gi, // Words with common tech suffixes
      /[a-z]+(?:[-_][a-z]+)+\b/g, // Compound tech terms
      /\b\d+(?:\.\d+)+\b/g, // Version numbers
      /\b[a-z]+(?:\d+|\d[a-z]+)[a-z]*\b/gi // Tech terms with numbers
    ]

    const terms: string[] = []
    for (const pattern of technicalPatterns) {
      const matches = content.matchAll(pattern)
      if (matches) {
        matches.forEach(match => {
          const term = match[0]
          if (term.length >= 2 && term.length <= 15 && !terms.includes(term)) {
            terms.push(term)
          }
        })
      }
    }

    return terms.slice(0, 20)
  }

  /**
   * Extract domain-specific terms
   */
  private extractDomainTerms(content: string, fileType: string): string[] {
    const domainTerms: string[] = []
    
    // File type specific terms
    const fileTypeTerms: Record<string, string[]> = {
      'js': ['function', 'const', 'let', 'var', 'async', 'await', 'Promise', 'callback', 'arrow', 'spread', 'object', 'array', 'map', 'filter', 'reduce', 'find', 'some', 'every'],
      'ts': ['interface', 'type', 'enum', 'class', 'extends', 'implements', 'public', 'private', 'protected', 'readonly', 'readonly', 'readonly', 'readonly'],
      'py': ['def', 'class', 'import', 'from', 'as', 'self', '__init__', '__name__', '__main__', 'lambda', 'yield', 'await'],
      'rb': ['def', 'module', 'class', 'include', 'require', 'attr_accessor', 'attr_writer', 'private', 'protected'],
      'go': ['func', 'package', 'import', 'const', 'var', 'struct', 'interface', 'goroutine', 'chan'],
      'rs': ['fn', 'let', 'mut', 'const', 'static', 'pub', 'use', 'mod', 'crate', 'struct', 'enum', 'impl', 'as', 'where'],
      'java': ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'abstract', 'static', 'final', 'void', 'int', 'boolean', 'String'],
      'cpp': ['class', 'public', 'private', 'protected', 'virtual', 'override', 'static', 'const', 'void', 'int', 'float', 'double', 'bool']
    }

    if (fileTypeTerms[fileType]) {
      domainTerms.push(...fileTypeTerms[fileType])
    }

    // Programming concepts (language-agnostic)
    const programmingConcepts = [
      'algorithm', 'data structure', 'design pattern', 'concurrency', 'parallelism',
      'error handling', 'validation', 'authentication', 'authorization', 'encryption',
      'database', 'query', 'optimization', 'caching', 'memoization', 'lazy loading',
      'asynchronous', 'synchronous', 'callback', 'promise', 'async/await', 'generator',
      'module', 'namespace', 'scope', 'closure', 'inheritance', 'polymorphism', 'encapsulation',
      'immutable', 'mutable', 'reference', 'value', 'pointer', 'null', 'undefined',
      'array', 'list', 'set', 'map', 'hash', 'tree', 'graph', 'stack', 'queue',
      'iteration', 'recursion', 'loop', 'condition', 'switch', 'case', 'break', 'continue',
      'function', 'method', 'procedure', 'routine', 'constructor', 'destructor',
      'class', 'object', 'instance', 'prototype', 'interface', 'abstract', 'concrete',
      'library', 'framework', 'package', 'dependency', 'version', 'release', 'deployment',
      'testing', 'debugging', 'logging', 'monitoring', 'profiling', 'optimization'
    ]

    const contentLower = content.toLowerCase()
    const foundConcepts = programmingConcepts.filter(concept => 
      contentLower.includes(concept.toLowerCase())
    )

    domainTerms.push(...foundConcepts)

    // Remove duplicates
    const uniqueTerms = [...new Set(domainTerms)]
    return uniqueTerms.slice(0, 15)
  }

  /**
   * Extract key phrases
   */
  private extractKeyPhrases(content: string): string[] {
    const phrases: string[] = []
    const sentences = content.split(/[.!?]+/)

    for (const sentence of sentences) {
      const words = sentence.split(/\s+/)
      if (words.length >= 3 && words.length <= 10) {
        const phrase = words.join(' ')
        if (phrase.length >= 10 && phrase.length <= 60) {
          phrases.push(phrase)
        }
      }
    }

    return [...new Set(phrases)].slice(0, 15)
  }

  /**
   * Assess content complexity
   */
  private assessComplexity(content: string, fileType: string): 'beginner' | 'intermediate' | 'advanced' {
    let complexityScore = 0

    // Length (normalized per file type)
    const lengthScore = content.length / 1000
    complexityScore += Math.min(lengthScore, 3) // Max 3 points for length

    // Sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = content.length / sentences.length
    if (avgSentenceLength > 30) complexityScore += 2
    else if (avgSentenceLength > 20) complexityScore += 1

    // Vocabulary diversity
    const words = content.split(/\s+/)
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))]
    const vocabularyRichness = uniqueWords.length / words.length
    if (vocabularyRichness > 0.6) complexityScore -= 0.5
    else if (vocabularyRichness < 0.3) complexityScore += 0.5

    // Technical complexity
    const technicalTerms = this.extractTechnicalTerms(content)
    const codeKeywords = ['function', 'class', 'interface', 'async', 'await', 'Promise', 'algorithm', 'data structure', 'design pattern', 'concurrency', 'parallelism']
    const hasCodeKeywords = codeKeywords.some(keyword => content.toLowerCase().includes(keyword))
    if (hasCodeKeywords) complexityScore += 2

    const normalizedScore = (complexityScore - 1) / 6 + 0.5 // Normalize to 0.5-1.0 range, shift to 0-0.5

    if (normalizedScore < 0.25) return 'beginner'
    if (normalizedScore < 0.5) return 'intermediate'
    return 'advanced'
  }

  /**
   * Assess educational level
   */
  private assessEducationalLevel(content: string): string {
    const indicators: string[] = []
    const contentLower = content.toLowerCase()

    // Beginner indicators
    if (contentLower.includes('introduction') || contentLower.includes('getting started') || 
        contentLower.includes('overview') || contentLower.includes('basics') ||
        contentLower.includes('fundamental') || contentLower.includes('simple')) {
      indicators.push('beginner')
    }

    // Intermediate indicators
    if (contentLower.includes('intermediate') || contentLower.includes('building on') || 
        contentLower.includes('deep dive') || contentLower.includes('advanced concepts') ||
        contentLower.includes('practical application')) {
      indicators.push('intermediate')
    }

    // Advanced indicators
    if (contentLower.includes('advanced') || contentLower.includes('mastering') || 
        contentLower.includes('complex') || contentLower.includes('specialized') ||
        contentLower.includes('enterprise') || contentLower.includes('production-ready')) {
      indicators.push('advanced')
    }

    // Determine level based on indicators
    const beginnerCount = indicators.filter(i => i === 'beginner').length
    const intermediateCount = indicators.filter(i => i === 'intermediate').length
    const advancedCount = indicators.filter(i => i === 'advanced').length

    if (advancedCount >= 2) return 'advanced'
    if (intermediateCount >= 2) return 'intermediate'
    return 'beginner'
  }

  /**
   * Infer target audience
   */
  private inferTargetAudience(content: string): string {
    const contentLower = content.toLowerCase()
    const audienceIndicators: Record<string, string> = {
      'beginner': 'beginners, newcomers, starters',
      'intermediate': 'intermediates, experienced users, professionals',
      'advanced': 'experts, specialists, advanced practitioners',
      'technical': 'developers, engineers, architects, technical professionals',
      'general': 'general audience, anyone interested, podcast listeners'
    }

    for (const [audience, indicators] of Object.entries(audienceIndicators)) {
      const hasIndicator = indicators.split(', ').some(indicator => 
        contentLower.includes(indicator)
      )
      if (hasIndicator) {
        return audience
      }
    }

    return 'general' // Default if no clear indicators
  }

  /**
   * Extract narrative structure
   */
  private extractNarrativeStructure(content: string, fileType: string): any {
    const narrative = {
      style: 'unknown',
      tone: 'unknown',
      pacing: 'unknown',
      voice: 'unknown',
      examples: [],
      stories: []
    }

    // Analyze style based on structure markers
    if (content.includes('# ') || content.includes('## ')) {
      narrative.style = 'structured'
    } else if (content.includes('---') || content.includes('***')) {
      narrative.style = 'conversational'
    } else {
      narrative.style = 'prose'
    }

    // Analyze tone using sentiment-like patterns
    const toneIndicators: Record<string, string[]> = {
      enthusiastic: ['excited', 'amazing', 'love', 'passionate', 'energetic'],
      professional: ['professional', 'formal', 'business', 'corporate', 'official'],
      casual: ['casual', 'informal', 'relaxed', 'friendly', 'conversational'],
      humorous: ['funny', 'humor', 'joke', 'laugh', 'playful', 'witty'],
      serious: ['serious', 'solemn', 'grave', 'important', 'critical', 'urgent']
    }

    for (const [tone, indicators] of Object.entries(toneIndicators)) {
      if (indicators.some(indicator => content.toLowerCase().includes(indicator))) {
        narrative.tone = tone
        break
      }
    }

    // Analyze pacing based on sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = content.length / sentences.length

    if (avgSentenceLength > 40) narrative.pacing = 'slow'
    else if (avgSentenceLength > 25) narrative.pacing = 'moderate'
    else if (avgSentenceLength > 15) narrative.pacing = 'fast'
    else narrative.pacing = 'moderate'

    // Extract examples and stories
    const examplePatterns = [
      /for example/gi,
      /as an example/gi,
      /consider/gi,
      /imagine/gi,
      /scenario/gi,
      /story/gi
    ]

    for (const pattern of examplePatterns) {
      const matches = content.matchAll(pattern)
      if (matches) {
        narrative.examples.push(...matches)
      }
    }

    return narrative
  }

  /**
   * Extract metadata
   */
  private extractMetadata(content: string, fileName: string, fileType: string): any {
    const metadata = {
      tags: this.extractTags(content),
      categories: this.extractCategories(content, fileType),
      author: this.extractAuthor(content),
      version: this.extractVersion(content)
    }

    return metadata
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = []
    const contentLower = content.toLowerCase()

    // Common podcast/technical tags
    const commonTags = [
      'tutorial', 'introduction', 'overview', 'guide', 'reference', 'documentation',
      'architecture', 'design', 'implementation', 'best practices', 'pattern',
      'concept', 'principle', 'technique', 'strategy', 'method', 'approach',
      'beginner', 'intermediate', 'advanced', 'expert', 'professional',
      'technical', 'educational', 'entertainment', 'news', 'story',
      'analysis', 'explanation', 'example', 'demonstration', 'walkthrough',
      'python', 'javascript', 'typescript', 'java', 'go', 'rust', 'web',
      'frontend', 'backend', 'database', 'api', 'framework', 'library'
    ]

    for (const tag of commonTags) {
      if (contentLower.includes(tag)) {
        tags.push(tag)
      }
    }

    return [...new Set(tags)].slice(0, 10)
  }

  /**
   * Extract categories from content
   */
  private extractCategories(content: string, fileType: string): string[] {
    const categories: string[] = []
    const contentLower = content.toLowerCase()

    const categoryPatterns: Record<string, RegExp> = {
      'Documentation': /(?:documentation|docs|readme|guide|tutorial)/gi,
      'Code': /(?:code|source|implementation|script|function|class|interface)/gi,
      'Content': /(?:content|podcast|script|episode|segment|audio|tts)/gi,
      'Architecture': /(?:architecture|design|pattern|structure|system)/gi,
      'Tutorial': /(?:tutorial|walkthrough|demonstration|example|for beginner)/gi,
      'Reference': /(?:reference|api|library|framework|documentation)/gi
    }

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(content)) {
        categories.push(category)
      }
    }

    return [...new Set(categories)]
  }

  /**
   * Extract author from content
   */
  private extractAuthor(content: string): string | undefined {
    const authorPatterns = [
      /(?:author|by|created by|written by)\s*:\s*([^\n\r]+?)/gi,
      /(?:---|\*\*\*)\s*author\s*:\s*([^\n\r]+?)/gi
    ]

    for (const pattern of authorPatterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return undefined
  }

  /**
   * Extract version from content
   */
  private extractVersion(content: string): string | undefined {
    const versionPatterns = [
      /(?:version|ver)\s*:\s*v?(\d+[\.\d+]*)/gi,
      /(?:---|\*\*\*)\s*version\s*:\s*v?(\d+[\.\d+]*)/gi,
      /v(\d+[\.\d+]*)/gi
    ]

    for (const pattern of versionPatterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return undefined
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(analysis: any, metadata: any): number {
    let score = 0.5 // Base score

    // Higher score for content with clear themes
    if (analysis.semantics?.themes?.length > 0) {
      score += 0.2
    }

    // Higher score for content with clear concepts
    if (analysis.semantics?.concepts?.length > 0) {
      score += 0.15
    }

    // Higher score for appropriate complexity level
    if (analysis.semantics?.complexity === 'intermediate') {
      score += 0.1
    }

    // Higher score for recent content
    const lastAnalyzed = metadata.lastAnalyzed
    const daysSinceAnalysis = lastAnalyzed 
      ? (Date.now() - new Date(lastAnalyzed).getTime()) / (1000 * 60 * 24)
      : 365 // Default to 365 days
    const recencyScore = Math.max(0, 1 - (daysSinceAnalysis / 365))
    score += recencyScore * 0.15

    // Cap at 1.0
    return Math.min(score, 1.0)
  }

  /**
   * Analyze entire project
   */
  async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
    console.log('[Deep Content Analyzer] Starting project analysis:', projectPath)

    // Step 1: Scan project folder
    const scanResult = await this.scanProjectFolder(projectPath, {
      extensions: ['.md', '.txt', '.js', '.ts', '.py', '.py', '.rb', '.go', '.java', '.json', '.yaml', '.yml'],
      excludePatterns: ['node_modules', '.next', '.git', 'dist', 'build']
    })

    // Step 2: Analyze each file
    const analyses: Map<string, ContentAnalysis> = new Map()
    let processedFiles = 0

    for (const file of scanResult.files) {
      if (processedFiles % 100 === 0) {
        console.log(`[Deep Content Analyzer] Progress: ${processedFiles}/${scanResult.files.length} files analyzed`)
      }

      const analysis = await this.analyzeFile(file.path)
      analyses.set(file.path, analysis)
      processedFiles++
    }

    // Step 3: Extract project-level insights
    const projectAnalysis = await this.extractProjectInsights(analyses, scanResult)

    console.log('[Deep Content Analyzer] Project analysis complete:', {
      totalFiles: projectAnalysis.totalFiles,
      themes: projectAnalysis.themes.length,
      concepts: projectAnalysis.concepts.length
      complexity: projectAnalysis.complexity
    })

    // Store in knowledge graph
    this.projectAnalysis = projectAnalysis

    return projectAnalysis
  }

  /**
   * Extract project-level insights
   */
  private async extractProjectInsights(analyses: Map<string, ContentAnalysis>, scanResult: any): Promise<ProjectAnalysis> {
    const allThemes: string[] = []
    const allConcepts: string[] = []
    const allTopics: string[] = []
    const complexities: ('beginner' | 'intermediate' | 'advanced')[] = []

    // Aggregate from all files
    for (const analysis of analyses.values()) {
      allThemes.push(...analysis.semantics.themes)
      allConcepts.push(...analysis.semantics.concepts)
      allTopics.push(...analysis.semantics.topics)
      complexities.push(analysis.semantics.complexity)
    }

    // Get unique and limited sets
    const uniqueThemes = [...new Set(allThemes)].slice(0, 15)
    const uniqueConcepts = [...new Set(allConcepts)].slice(0, 30)
    const uniqueTopics = [...new Set(allTopics)].slice(0, 20)

    // Determine project complexity
    const avgComplexity = complexities.length > 0 
      ? complexities.reduce((sum: any, c: any) => sum + (c === 'advanced' ? 3 : c === 'intermediate' ? 2 : 1), 0) / complexities.length
      : 1.5 // Default

    const projectComplexity: 'beginner' | 'intermediate' | 'advanced' = 
      avgComplexity >= 2 ? 'advanced' : avgComplexity >= 1.5 ? 'intermediate' : 'beginner'

    // Build connections map
    const connections: ConnectionMap = {}
    for (const analysis of analyses.values()) {
      const concepts = analysis.semantics.concepts
      for (const concept of concepts) {
        if (!connections[concept]) {
          connections[concept] = {
            related: analysis.semantics.themes,
            type: 'theme',
            strength: 0.7
          }
        }
      }
    }

    // Suggest episodes based on content
    const suggestedEpisodes = this.generateEpisodeSuggestions(uniqueThemes, uniqueConcepts, projectComplexity)

    // Identify gaps and opportunities
    const gaps = this.identifyContentGaps(analyses)
    const opportunities = this.identifyContentOpportunities(analyses)

    return {
      projectPath: scanResult.files[0]?.path || '',
      totalFiles: scanResult.files.length,
      totalSize: scanResult.totalSize,
      fileTypes: this.categorizeFiles(scanResult.files),
      themes: uniqueThemes,
      concepts: uniqueConcepts,
      relationships: connections,
      complexity: projectComplexity,
      targetAudience: this.inferTargetAudience(scanResult.files[0]?.path || ''),
      educationalGoals: this.generateEducationalGoals(uniqueThemes, projectComplexity),
      recommendedStructure: this.recommendStructure(analyses),
      suggestedEpisodes,
      gaps,
      opportunities
    }
  }

  /**
   * Categorize files by type
   */
  private categorizeFiles(files: any[]): Map<string, number> {
    const fileTypes = new Map<string, number>()

    for (const file of files) {
      const type = file.type
      fileTypes.set(type, (fileTypes.get(type) || 0) + 1)
    }

    return fileTypes
  }

  /**
   * Generate episode suggestions
   */
  private generateEpisodeSuggestions(themes: string[], concepts: string[], complexity: string): EpisodeSuggestion[] {
    const episodes: EpisodeSuggestion[] = []

    // Suggest episodes based on themes
    for (let i = 0; i < Math.min(themes.length, 5); i++) {
      const theme = themes[i]
      const duration = complexity === 'beginner' ? 10 : complexity === 'intermediate' ? 15 : 25
      const mainTopics = concepts.slice(0, 3)
      const keyTakeaways = [`${theme} overview`, `${theme} core concepts`, `${theme} practical application`]

      episodes.push({
        title: `Episode ${i + 1}: ${theme}`,
        description: `Explore ${theme} in a ${duration}-minute episode covering key concepts and practical applications`,
        duration,
        mainTopics,
        keyTakeaways,
        complexity,
        suggestedSegments: [
          `Introduction to ${theme} (${duration * 0.15} minutes)`,
          `Core concepts of ${theme} (${duration * 0.35} minutes)`,
          `Practical applications and examples (${duration * 0.25} minutes)`,
          `Key takeaways and next steps (${duration * 0.25} minutes)`
        ],
        visualAids: [`Diagram showing ${theme} architecture`, `Chart with ${theme} statistics or data`]
      })
    }

    return episodes
  }

  /**
   * Generate educational goals
   */
  private generateEducationalGoals(themes: string[], complexity: string): string[] {
    const goals: string[] = []

    for (const theme of themes.slice(0, 5)) {
      if (complexity === 'beginner') {
        goals.push(`Introduce ${theme} fundamentals`)
        goals.push(`Provide beginner-friendly examples`)
        goals.push(`Use clear, simple explanations`)
      } else if (complexity === 'intermediate') {
        goals.push(`Cover ${theme} with practical examples`)
        goals.push(`Include real-world scenarios`)
        goals.push(`Provide intermediate-level depth`)
      } else {
        goals.push(`Dive deep into ${theme} complexity`)
        goals.push(`Include edge cases and best practices`)
        goals.push(`Connect ${theme} to related concepts`)
      }
    }

    return goals
  }

  /**
   * Identify content gaps
   */
  private identifyContentGaps(analyses: Map<string, ContentAnalysis>): string[] {
    const gaps: string[] = []

    // Check for missing documentation
    const hasDocs = Array.from(analyses.values()).some(analysis => 
      analysis.metadata?.categories?.includes('Documentation')
    )

    if (!hasDocs) {
      gaps.push('Missing documentation (README, API docs, guides)')
    }

    // Check for missing examples
    const hasExamples = Array.from(analyses.values()).some(analysis => 
      analysis.narrative.examples.length > 0
    )

    if (!hasExamples) {
      gaps.push('Missing practical examples in code or content')
    }

    // Check for missing tutorials
    const hasTutorials = Array.from(analyses.values()).some(analysis => 
      analysis.metadata?.categories?.includes('Tutorial')
    )

    if (!hasTutorials) {
      gaps.push('Missing step-by-step tutorials for beginners')
    }

    return gaps
  }

  /**
   * Identify content opportunities
   */
  private identifyContentOpportunities(analyses: Map<string, ContentAnalysis>): string[] {
    const opportunities: string[] = []

    // Suggest adding quick-start guides
    const hasQuickStart = Array.from(analyses.values()).some(analysis => 
      analysis.fileName.toLowerCase().includes('quickstart') || 
      analysis.fileName.toLowerCase().includes('getting-started')
    )

    if (!hasQuickStart) {
      opportunities.push('Add quick-start guide for beginners')
    }

    // Suggest adding examples folder
    const hasExamplesFolder = Array.from(analyses.values()).some(analysis => 
      analysis.filePath.includes('/examples/') || 
      analysis.filePath.includes('/example/')
    )

    if (!hasExamplesFolder) {
      opportunities.push('Create examples folder with code samples')
    }

    // Suggest adding interactive elements
    opportunities.push('Add interactive quizzes or exercises for better learning')

    return opportunities
  }

  /**
   * Recommend project structure
   */
  private recommendStructure(analyses: Map<string, ContentAnalysis>): string {
    const fileTypes = this.categorizeFiles(Array.from(analyses.values()).map(a => ({ type: a.fileType })))

    let recommendation = 'Good project structure with clear organization'

    if (fileTypes.has('js') || fileTypes.has('ts') || fileTypes.has('py')) {
      recommendation = 'Project has code files - ensure proper folder structure and documentation'
    }

    if (fileTypes.has('md') && fileTypes.has('Documentation')) {
      recommendation = 'Good documentation presence - consider adding code examples for better understanding'
    }

    if (fileTypes.size > 1 && !fileTypes.has('md')) {
      recommendation = 'Mix of file types detected - consider adding unified documentation'
    }

    return recommendation
  }

  /**
   * Get analysis progress
   */
  getProgress(projectPath: string): AnalysisProgress {
    const totalFiles = this.analysis.size
    const processedFiles = Array.from(this.analysis.values()).length
    const percentage = totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0

    const estimatedTimeRemaining = percentage > 0 
      ? `Estimated ${(100 - percentage) / 10} minutes remaining`
      : 'Starting analysis...'

    return {
      currentFile: '',
      processedFiles,
      totalFiles,
      percentage,
      estimatedTimeRemaining
    }
  }

  /**
   * Export analysis state
   */
  exportState() {
    return {
      analyses: Object.fromEntries(this.analysis),
      projectAnalysis: this.projectAnalysis,
      knowledgeGraph: Object.fromEntries(this.knowledgeGraph),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Import analysis state
   */
  importState(state: {
    analyses?: Record<string, ContentAnalysis>
    projectAnalysis?: ProjectAnalysis
    knowledgeGraph?: Record<string, any>
  }): void {
    if (state.analyses) {
      this.analysis = new Map(Object.entries(state.analyses))
    }

    if (state.projectAnalysis) {
      this.projectAnalysis = state.projectAnalysis
    }

    if (state.knowledgeGraph) {
      this.knowledgeGraph = new Map(Object.entries(state.knowledgeGraph))
    }

    console.log('[Deep Content Analyzer] State imported')
  }

  /**
   * Clear analysis state
   */
  clearState(): void {
    this.analysis.clear()
    this.projectAnalysis = null
    this.knowledgeGraph.clear()
    
    console.log('[Deep Content Analyzer] State cleared')
  }
}

// Create singleton instance
export const deepContentAnalyzer = new DeepContentAnalyzer()

// Export main functions
export const {
  scanProjectFolder,
  analyzeFile,
  analyzeProject,
  getProgress,
  exportState,
  importState,
  clearState
} = deepContentAnalyzer
