// Streamlined Knowledge Graph System
// 
// Keeps it SIMPLE while being POWERFUL:
// - Simple Node/Edge structure
// - Fast lookups and queries
// - Easy to extend and maintain
// - High performance for cognitive operations

export interface KnowledgeNode {
  id: string
  type: 'concept' | 'theme' | 'topic' | 'file' | 'episode'
  label: string
  data: any
  connections: Connection[]
  metadata: {
    confidence: number
    timestamp: string
    source: string
    userId?: string
    projectId?: string
  }
}

export interface Connection {
  fromNodeId: string
  toNodeId: string
  type: 'hierarchy' | 'related' | 'reference' | 'dependency' | 'theme'
  strength: number // 0.0 to 1.0
  metadata?: any
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>
  edges: Connection[]
  index: {
    byType: Map<string, string[]>
    byLabel: Map<string, string[]>
    bySource: Map<string, string[]>
    byUser: Map<string, string[]>
    byProject: Map<string, string[]>
  }
}

// Streamlined Knowledge Graph
class StreamlinedKnowledgeGraph {
  private graph: KnowledgeGraph = {
    nodes: new Map(),
    edges: [],
    index: {
      byType: new Map(),
      byLabel: new Map(),
      bySource: new Map(),
      byUser: new Map(),
      byProject: new Map()
    }
  }

  /**
   * Add node to knowledge graph (STREAMLINED)
   */
  addNode(node: KnowledgeNode): void {
    this.graph.nodes.set(node.id, node)
    
    // Update indexes for fast lookups
    this.updateIndexes(node)
    
    console.log(`[Knowledge Graph] Added node: ${node.id} (${node.type})`)
  }

  /**
   * Add connection between nodes (STREAMLINED)
   */
  addConnection(connection: Connection): void {
    // Validate connection
    if (!this.graph.nodes.has(connection.fromNodeId) || 
        !this.graph.nodes.has(connection.toNodeId)) {
      console.warn(`[Knowledge Graph] Invalid connection: ${connection.fromNodeId} -> ${connection.toNodeId}`)
      return
    }

    this.graph.edges.push(connection)
    
    // Update node connections
    const fromNode = this.graph.nodes.get(connection.fromNodeId)!
    fromNode.connections.push(connection)
    
    const toNode = this.graph.nodes.get(connection.toNodeId)!
    toNode.connections.push(connection)
    
    console.log(`[Knowledge Graph] Added connection: ${connection.fromNodeId} -> ${connection.toNodeId} (${connection.type}, strength: ${connection.strength})`)
  }

  /**
   * Add node with connections (STREAMLINED)
   */
  addNodeWithConnections(node: KnowledgeNode, connections: Connection[]): void {
    this.addNode(node)
    for (const conn of connections) {
      this.addConnection(conn)
    }
  }

  /**
   * Get node by ID
   */
  getNode(id: string): KnowledgeNode | undefined {
    return this.graph.nodes.get(id)
  }

  /**
   * Find related nodes (STREAMLINED but POWERFUL)
   */
  findRelated(nodeId: string, options: {
    types?: string[]
    maxDepth?: number
    minStrength?: number
    limit?: number
  } = {}): KnowledgeNode[] {
    const results: KnowledgeNode[] = []
    const visited = new Set<string>()
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }]

    const {
      types = ['related', 'theme', 'reference'],
      maxDepth = 3,
      minStrength = 0.3,
      limit = 10
    } = options

    while (queue.length > 0 && results.length < limit) {
      const { nodeId, depth } = queue.shift()!

      if (visited.has(nodeId) || depth > maxDepth) {
        continue
      }

      visited.add(nodeId)

      const node = this.graph.nodes.get(nodeId)
      if (!node) {
        continue
      }

      // Add node to results
      if (this.matchesTypes(node, types)) {
        results.push(node)
      }

      // Add connected nodes to queue
      const connections = node.connections.filter(conn => 
        conn.strength >= minStrength && 
        types.includes(conn.type)
      )

      for (const conn of connections) {
        queue.push({ nodeId: conn.toNodeId, depth: depth + 1 })
      }
    }

    return results
  }

  /**
   * Find shortest path between nodes (STREAMLINED)
   */
  findShortestPath(fromNodeId: string, toNodeId: string): {
    path: KnowledgeNode[]
    strength: number
  } | null {
    // Simple BFS for shortest path
    const queue: Array<{ nodeId: string; path: KnowledgeNode[] }> = [
      { nodeId: fromNodeId, path: [this.graph.nodes.get(fromNodeId)!] }
    ]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!

      if (nodeId === toNodeId) {
        return { path, strength: this.calculatePathStrength(path) }
      }

      if (visited.has(nodeId)) {
        continue
      }

      visited.add(nodeId)

      const node = this.graph.nodes.get(nodeId)
      if (!node) {
        continue
      }

      // Add neighbors to queue
      for (const conn of node.connections) {
        if (conn.strength >= 0.5) { // Only strong connections
          queue.push({
            nodeId: conn.toNodeId,
            path: [...path, this.graph.nodes.get(conn.toNodeId)!]
          })
        }
      }
    }

    return null
  }

  /**
   * Find all nodes by type (STREAMLINED)
   */
  findByType(type: string): KnowledgeNode[] {
    const nodeIds = this.graph.index.byType.get(type) || []
    return nodeIds
      .map(id => this.graph.nodes.get(id)!)
      .filter(node => node !== undefined)
  }

  /**
   * Search nodes by label (STREAMLINED)
   */
  searchByLabel(query: string, limit: number = 10): KnowledgeNode[] {
    const results: KnowledgeNode[] = []
    const queryLower = query.toLowerCase()

    // Search through label index
    const nodeIds = this.graph.index.byLabel.get('concept') || []
      .concat(this.graph.index.byLabel.get('theme') || [])
      .concat(this.graph.index.byLabel.get('topic') || [])

    for (const nodeId of nodeIds) {
      const node = this.graph.nodes.get(nodeId)
      if (!node) continue

      if (node.label.toLowerCase().includes(queryLower)) {
        results.push(node)
        if (results.length >= limit) {
          break
        }
      }
    }

    return results
  }

  /**
   * Get cluster of related concepts (STREAMLINED but POWERFUL)
   */
  getConceptCluster(conceptId: string, depth: number = 2): {
    nodes: KnowledgeNode[]
    themes: string[]
    relationships: string[]
  } {
    const nodes: KnowledgeNode[] = []
    const themes: Set<string> = new Set()
    const relationships: Set<string> = new Set()
    const visited = new Set<string>()
    const queue = [{ nodeId: conceptId, depth: 0 }]

    while (queue.length > 0) {
      const { nodeId, depth: currDepth } = queue.shift()!

      if (visited.has(nodeId) || currDepth > depth) {
        continue
      }

      visited.add(nodeId)

      const node = this.graph.nodes.get(nodeId)
      if (!node) {
        continue
      }

      nodes.push(node)

      // Extract themes
      if (node.type === 'theme') {
        themes.add(node.label)
      }

      // Extract relationships
      for (const conn of node.connections) {
        relationships.add(`${node.label} -> ${this.graph.nodes.get(conn.toNodeId)?.label}`)
      }

      // Add related nodes
      for (const conn of node.connections.filter(c => c.type === 'related' || c.type === 'theme')) {
        if (!visited.has(conn.toNodeId)) {
          queue.push({ nodeId: conn.toNodeId, depth: currDepth + 1 })
        }
      }
    }

    return {
      nodes: nodes.slice(0, 15), // Limit to 15 nodes
      themes: Array.from(themes),
      relationships: Array.from(relationships).slice(0, 10)
    }
  }

  /**
   * Update node with new data (STREAMLINED)
   */
  updateNode(nodeId: string, updates: Partial<KnowledgeNode>): boolean {
    const node = this.graph.nodes.get(nodeId)
    if (!node) {
      console.warn(`[Knowledge Graph] Node not found: ${nodeId}`)
      return false
    }

    // Update node
    Object.assign(node, updates)
    
    // Update timestamp
    node.metadata.timestamp = new Date().toISOString()
    
    // Update indexes
    this.updateIndexes(node)

    console.log(`[Knowledge Graph] Updated node: ${nodeId}`)
    return true
  }

  /**
   * Get statistics about knowledge graph (STREAMLINED)
   */
  getStats(): {
    totalNodes: number
    nodesByType: Record<string, number>
    totalConnections: number
    connectionsByType: Record<string, number>
    averageStrength: number
    lastUpdated: string
  } {
    const nodesByType: Record<string, number> = {}
    let totalConnections = 0
    let totalStrength = 0

    // Count nodes by type
    for (const node of this.graph.nodes.values()) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1
      totalConnections += node.connections.length
      for (const conn of node.connections) {
        totalStrength += conn.strength
      }
    }

    // Count connections by type
    const connectionsByType: Record<string, number> = {}
    for (const edge of this.graph.edges) {
      connectionsByType[edge.type] = (connectionsByType[edge.type] || 0) + 1
    }

    return {
      totalNodes: this.graph.nodes.size,
      nodesByType,
      totalConnections: this.graph.edges.length,
      connectionsByType,
      averageStrength: totalConnections > 0 ? totalStrength / totalConnections : 0,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Clear all data (STREAMLINED)
   */
  clear(): void {
    this.graph.nodes.clear()
    this.graph.edges = []
    this.graph.index.byType.clear()
    this.graph.index.byLabel.clear()
    this.graph.index.bySource.clear()
    this.graph.index.byUser.clear()
    this.graph.index.byProject.clear()
    
    console.log('[Knowledge Graph] Cleared all data')
  }

  /**
   * Export graph data (STREAMLINED)
   */
  exportState(): {
    nodes: Record<string, KnowledgeNode>
    edges: Connection[]
    stats: any
    timestamp: string
  } {
    const nodesExport: Record<string, KnowledgeNode> = {}
    
    for (const [id, node] of this.graph.nodes.entries()) {
      // Remove circular connections for export
      nodesExport[id] = {
        ...node,
        connections: [] // Will be reconstructed from edges
      }
    }

    return {
      nodes: nodesExport,
      edges: this.graph.edges,
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Import graph data (STREAMLINED)
   */
  importState(state: {
    nodes?: Record<string, KnowledgeNode>
    edges?: Connection[]
  }): void {
    this.clear()

    // Import nodes
    if (state.nodes) {
      for (const [id, nodeData] of Object.entries(state.nodes)) {
        const node: KnowledgeNode = {
          ...nodeData,
          connections: [] // Will be reconstructed
        }
        this.graph.nodes.set(id, node)
        this.updateIndexes(node)
      }
    }

    // Import edges
    if (state.edges) {
      for (const edge of state.edges) {
        this.graph.edges.push(edge)
        
        // Update node connections
        const fromNode = this.graph.nodes.get(edge.fromNodeId)
        const toNode = this.graph.nodes.get(edge.toNodeId)
        
        if (fromNode) {
          fromNode.connections.push(edge)
        }
        if (toNode) {
          toNode.connections.push(edge)
        }
      }
    }

    console.log('[Knowledge Graph] Imported state:', {
      nodes: this.graph.nodes.size,
      edges: this.graph.edges.length
    })
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Update indexes for fast lookups (STREAMLINED)
   */
  private updateIndexes(node: KnowledgeNode): void {
    // Index by type
    if (!this.graph.index.byType.has(node.type)) {
      this.graph.index.byType.set(node.type, [])
    }
    this.graph.index.byType.get(node.type)!.push(node.id)

    // Index by label
    if (!this.graph.index.byLabel.has(node.label)) {
      this.graph.index.byLabel.set(node.label, [])
    }
    this.graph.index.byLabel.get(node.label)!.push(node.id)

    // Index by source
    if (node.metadata.source && !this.graph.index.bySource.has(node.metadata.source)) {
      this.graph.index.bySource.set(node.metadata.source, [])
    }
    this.graph.index.bySource.get(node.metadata.source)!.push(node.id)

    // Index by user
    if (node.metadata.userId && !this.graph.index.byUser.has(node.metadata.userId)) {
      this.graph.index.byUser.set(node.metadata.userId, [])
    }
    this.graph.index.byUser.get(node.metadata.userId)!.push(node.id)

    // Index by project
    if (node.metadata.projectId && !this.graph.index.byProject.has(node.metadata.projectId)) {
      this.graph.index.byProject.set(node.metadata.projectId, [])
    }
    this.graph.index.byProject.get(node.metadata.projectId)!.push(node.id)
  }

  /**
   * Check if node matches filter types (STREAMLINED)
   */
  private matchesTypes(node: KnowledgeNode, types: string[]): boolean {
    return types.includes(node.type)
  }

  /**
   * Calculate path strength (STREAMLINED)
   */
  private calculatePathStrength(path: KnowledgeNode[]): number {
    if (path.length < 2) {
      return 1.0
    }

    let totalStrength = 0
    let count = 0

    for (let i = 0; i < path.length - 1; i++) {
      const fromNode = path[i]
      const toNode = path[i + 1]
      
      const connection = fromNode.connections.find(c => c.toNodeId === toNode.id)
      if (connection) {
        totalStrength += connection.strength
        count++
      }
    }

    return count > 0 ? totalStrength / count : 1.0
  }
}

// Create singleton instance
export const knowledgeGraph = new StreamlinedKnowledgeGraph()

// Export main functions (STREAMLINED interface)
export const {
  addNode,
  addNodeWithConnections,
  addConnection,
  getNode,
  findRelated,
  findShortestPath,
  findByType,
  searchByLabel,
  getConceptCluster,
  updateNode,
  getStats,
  clear,
  exportState,
  importState
} = knowledgeGraph
