import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'
import { Document } from 'langchain/document'

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-small' // Cost-effective embedding model
})

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT || 'production'
})

// Create vector store
const vectorStore = new PineconeStore({
  namespace: 'podcast-maker',
  embeddings: embeddings,
  pineconeIndex: pinecone.index('documents')
})

/**
 * Ingest documents into vector database
 * 
 * @param text - Text content to ingest
 * @param metadata - Metadata for the document (type, source, timestamp, etc.)
 * @param chunkSize - Size of each text chunk (default: 1000)
 * @param chunkOverlap - Overlap between chunks (default: 200)
 * @returns { success, documentCount, chunksCreated }
 */
export async function ingestDocument(
  text: string,
  metadata: Record<string, any> = {},
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<{ success: boolean; documentCount: number; chunksCreated: number }> {
  try {
    console.log('[RAG Pipeline] Ingesting document:', { 
      textLength: text.length,
      metadata 
    })

    // Split document into chunks
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += (chunkSize - chunkOverlap)) {
      const chunk = text.slice(i, i + chunkSize)
      if (chunk.length > 0) {
        chunks.push(chunk)
      }
    }

    console.log('[RAG Pipeline] Created', chunks.length, 'chunks')

    // Create LangChain documents
    const documents: Document[] = chunks.map((chunk, index) => ({
      pageContent: chunk,
      metadata: {
        ...metadata,
        chunkId: index,
        totalChunks: chunks.length,
        timestamp: new Date().toISOString()
      }
    }))

    // Add to vector store
    await vectorStore.addDocuments(documents)

    console.log('[RAG Pipeline] Successfully ingested', chunks.length, 'chunks')

    return {
      success: true,
      documentCount: 1,
      chunksCreated: chunks.length
    }

  } catch (error) {
    console.error('[RAG Pipeline] Error ingesting document:', error)

    return {
      success: false,
      documentCount: 0,
      chunksCreated: 0
    }
  }
}

/**
 * Search vector database for similar documents
 * 
 * @param query - Query text to search for
 * @param k - Number of top results to return (default: 5)
 * @param filter - Optional metadata filter (e.g., { type: 'project_document' })
 * @returns { success, documents, averageScore, queryEmbedding }
 */
export async function searchDocuments(
  query: string,
  k: number = 5,
  filter?: Record<string, any>
): Promise<{
  success: boolean;
  documents: any[];
  averageScore: number;
  queryEmbedding: number[];
}> {
  try {
    console.log('[RAG Pipeline] Searching for:', { query, k, filter })

    // Create similarity search with optional filter
    const similaritySearch = vectorStore.asRetriever({
      k,
      filter,
      searchType: 'similarity',
      searchKwargs: {
        namespace: 'podcast-maker',
        filter: filter ? JSON.stringify(filter) : undefined
      }
    })

    // Perform search
    const results = await similaritySearch.invoke(query)

    // Calculate average score
    const averageScore = results.length > 0
      ? results.reduce((sum, doc) => sum + doc.metadata.score, 0) / results.length
      : 0

    console.log('[RAG Pipeline] Found', results.length, 'documents')

    return {
      success: true,
      documents: results,
      averageScore,
      queryEmbedding: results.length > 0 ? results[0].metadata.vector : []
    }

  } catch (error) {
    console.error('[RAG Pipeline] Error searching documents:', error)

    return {
      success: false,
      documents: [],
      averageScore: 0,
      queryEmbedding: []
    }
  }
}

/**
 * Generate text using RAG (Retrieval-Augmented Generation)
 * 
 * @param query - User's query or request
 * @param k - Number of documents to retrieve (default: 5)
 * @param llm - LLM function to generate with RAG context
 * @param filter - Optional metadata filter
 * @returns { success, response, sources, contextUsed, citations }
 */
export async function generateWithRAG(
  query: string,
  k: number = 5,
  llm?: (context: string, query: string) => Promise<string>,
  filter?: Record<string, any>
): Promise<{
  success: boolean;
  response: string;
  sources: any[];
  contextUsed: string;
  citations: string[];
}> {
  try {
    console.log('[RAG Pipeline] Generating with RAG:', { query, k, filter })

    // Step 1: Search for relevant documents
    const { success, documents, averageScore } = await searchDocuments(query, k, filter)

    if (!success || documents.length === 0) {
      console.log('[RAG Pipeline] No documents found, using query only')
      
      return {
        success: true,
        response: await (llm || generateWithDefaultLLM)('', query),
        sources: [],
        contextUsed: 'No relevant documents found',
        citations: []
      }
    }

    // Step 2: Assemble context from retrieved documents
    const contextParts = documents.map((doc, index) => 
      `[Source ${index + 1}]\n` +
      `Document: ${doc.metadata.source || 'Unknown'}\n` +
      `Relevance Score: ${doc.metadata.score.toFixed(3)}\n` +
      `Content: ${doc.pageContent.substring(0, 200)}...\n` +
      `[End Source ${index + 1}]\n`
    )

    const context = contextParts.join('\n\n')

    // Step 3: Generate with RAG context
    const ragPrompt = \`You are a podcast creation assistant. Use the following retrieved context to answer the user's question.

**Retrieved Context:**
\${context}

**User Request:**
\${query}

**Guidelines:**
- Use information from retrieved context when relevant and accurate
- If the context doesn't contain relevant information, say so
- Provide citations for information you use from context (e.g., [Source 1], [Source 2])
- Be clear, specific, and helpful
- Focus on creating high-quality podcast content

**Output Format:**
- Provide helpful, actionable response
- Include citations when using information from context
- Suggest next steps for podcast creation
- If additional information is needed, ask specific questions\`

    const response = await (llm || generateWithDefaultLLM)(ragPrompt, query)

    // Extract citations from response
    const citations = extractCitations(response, documents.length)

    console.log('[RAG Pipeline] RAG generation complete')

    return {
      success: true,
      response,
      sources: documents.map(doc => ({
        source: doc.metadata.source,
        score: doc.metadata.score,
        content: doc.pageContent.substring(0, 100)
      })),
      contextUsed: context.substring(0, 500) + '...', // Truncate for logs
      citations
    }

  } catch (error) {
    console.error('[RAG Pipeline] Error in RAG generation:', error)

    return {
      success: false,
      response: '',
      sources: [],
      contextUsed: '',
      citations: []
    }
  }
}

/**
 * Extract citations from LLM response
 * 
 * @param response - LLM response
 * @param numSources - Number of sources available
 * @returns Array of citation strings
 */
function extractCitations(response: string, numSources: number): string[] {
  const citations: string[] = []

  // Look for [Source N] patterns
  const sourcePattern = /\[Source (\d+)\]/g
  const matches = response.matchAll(sourcePattern)

  for (const match of matches) {
    const sourceNumber = parseInt(match[1])
    if (sourceNumber <= numSources) {
      citations.push(match[0])
    }
  }

  return citations
}

/**
 * Default LLM generation (fallback)
 */
async function generateWithDefaultLLM(context: string, query: string): Promise<string> {
  // This would call your existing LLM service (z-ai-web-dev-sdk or OpenAI)
  // For now, return a mock response
  
  const prompt = context ? \`Use this context: \${context}\n\nUser question: \${query}\` : \`User question: \${query}\`

  // Mock response for development
  return \`Based on your request for: \${query}

${context ? \`I analyzed the retrieved context and found relevant information. \` : \`Here are my suggestions:\`}

## Suggestions

1. **Start with a clear introduction** that hooks your listeners
2. **Structure your content** in 3-5 main sections
3. **Use real-world examples** to explain complex concepts
4. **Include stories or anecdotes** to make it engaging
5. **End with a strong call-to-action**

Let me know if you'd like me to help you with any specific aspect of your podcast creation process!\`
}

/**
 * Batch ingest multiple documents
 * 
 * @param documents - Array of { text, metadata } objects
 * @returns { success, totalDocuments, totalChunks }
 */
export async function batchIngestDocuments(
  documents: Array<{ text: string; metadata?: Record<string, any> }>
): Promise<{ success: boolean; totalDocuments: number; totalChunks: number }> {
  try {
    console.log('[RAG Pipeline] Batch ingesting', documents.length, 'documents')

    let totalChunks = 0

    for (const doc of documents) {
      const result = await ingestDocument(doc.text, doc.metadata)
      if (result.success) {
        totalChunks += result.chunksCreated
      }
    }

    console.log('[RAG Pipeline] Batch ingestion complete:', { 
      totalDocuments: documents.length,
      totalChunks
    })

    return {
      success: true,
      totalDocuments: documents.length,
      totalChunks
    }

  } catch (error) {
    console.error('[RAG Pipeline] Error in batch ingestion:', error)

    return {
      success: false,
      totalDocuments: 0,
      totalChunks: 0
    }
  }
}

export default {
  ingestDocument,
  searchDocuments,
  generateWithRAG,
  batchIngestDocuments
}
