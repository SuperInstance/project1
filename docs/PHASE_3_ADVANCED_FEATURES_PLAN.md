# Phase 3: Advanced Features Implementation Plan

## 🎯 Objective

Enhance Podcast Maker with advanced content analysis, premium TTS integration, and web scraping capabilities.

## 📊 Architecture Overview

```
【Phase 2: Agent-Native】 → 【Phase 3: Advanced Features】
Multi-Agent System → Extended with Advanced Capabilities
    ↓
Content Analysis → Enhanced with Code Scanning & Auto-Planning
Script Writing → Advanced with Markdown Parser & Real-time Validation
Audio Generation → Premium TTS Integration (ElevenLabs)
    ↓
Web Scraping → Firecrawl & Crawl4AI Integration
MCP Extensions → Additional Tools & Capabilities
```

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|--------|
| **ElevenLabs SDK** | Premium TTS with voice cloning | ^0.8.0 |
| **Firecrawl API** | Web scraping & content extraction | Latest |
| **Crawl4AI API** | Headless scraping & user auth | Latest |
| **MCP Protocol** | Model Context Protocol extensions | Latest |
| **React Markdown** | Script parsing & rendering | ^9.0.0 |
| **React State Management** | Advanced state for complex UI | Latest |

## 🚀 Implementation Roadmap

### Task 1: Advanced Content Analysis

**Goal:** Scan code, documentation, and extract themes automatically

#### 1.1 Code Scanning Agent
```typescript
// src/agents/code-analysis-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const codeAnalysisAgent = createAgent({
  name: 'code-analysis-agent',
  description: 'Scans code files and extracts podcast-relevant content',

  initialState: {
    scannedFiles: [],
    extractedFunctions: [],
    technicalConcepts: [],
    complexity: 'low'
  },

  tools: {
    scanCode: {
      description: 'Scan a code file for podcast-relevant content',
      parameters: {
        filePath: { type: 'string', description: 'Path to code file' },
        language: { type: 'string', description: 'Programming language' }
      }
    },

    extractFunctions: {
      description: 'Extract function names and purposes',
      parameters: {
        codeContent: { type: 'string', description: 'Code content to analyze' }
      }
    },

    identifyConcepts: {
      description: 'Identify technical concepts for explanation',
      parameters: {
        code: { type: 'string', description: 'Code to analyze' }
      }
    },

    suggestAnalogy: {
      description: 'Create real-world analogy for technical concept',
      parameters: {
        concept: { type: 'string', description: 'Technical concept' },
        targetAudience: { type: 'string', description: 'Audience level' }
      }
    }
  }
})
```

**Features:**
- Scan Python, JavaScript, TypeScript, Go, Rust, and other code
- Extract function names, classes, and key logic
- Identify complexity levels for podcast pacing
- Suggest analogies for complex technical concepts
- Generate explanations suitable for different audiences

**API Route:**
```typescript
// src/app/api/analyze-code/route.ts
import { readFile } from 'fs/promises'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: NextRequest) {
  const { filePath, language } = await req.json()
  
  const codeContent = await readFile(filePath, 'utf-8')
  
  const zai = await ZAI.create()
  const analysis = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a code analysis expert. Analyze this ${language} code and extract:
1. Key functions and their purposes
2. Main classes and their relationships
3. Technical concepts that need explanation
4. Complexity level (low, medium, high)
5. Suggest 3 real-world analogies for the main concepts

Code to analyze:
${codeContent}`
      }
    ]
  })
  
  return NextResponse.json({
    success: true,
    functions: parseFunctions(analysis.choices[0].message.content),
    concepts: parseConcepts(analysis.choices[0].message.content),
    complexity: determineComplexity(analysis.choices[0].message.content),
    analogies: parseAnalogies(analysis.choices[0].message.content),
    suggestedExplanations: generateExplanations(analysis.choices[0].message.content)
  })
}
```

#### 1.2 Documentation Parsing Agent
```typescript
// src/agents/doc-analysis-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const docAnalysisAgent = createAgent({
  name: 'doc-analysis-agent',
  description: 'Parses documentation and extracts key information',

  initialState: {
    parsedDocs: [],
    keySections: [],
    topics: [],
    glossary: []
  },

  tools: {
    parseDocument: {
      description: 'Parse a documentation file',
      parameters: {
        docContent: { type: 'string', description: 'Documentation content' },
        format: { type: 'string', description: 'md, txt, pdf, docx, etc.' }
      }
    },

    extractTopics: {
      description: 'Extract main topics from documentation',
      parameters: {
        sections: { type: 'array', description: 'Document sections' }
      }
    },

    identifyGlossary: {
      description: 'Create glossary of technical terms',
      parameters: {
        content: { type: 'string', description: 'Content to analyze' }
      }
    },

    suggestStructure: {
      description: 'Suggest podcast structure based on documentation',
      parameters: {
        topics: { type: 'array', description: 'Extracted topics' }
      }
    }
  }
})
```

**Features:**
- Parse markdown, text, PDF, and Word documents
- Extract key sections and topics
- Create glossaries for technical terms
- Suggest podcast episode structures
- Identify narrative flow and pacing needs

**API Route:**
```typescript
// src/app/api/parse-doc/route.ts
export async function POST(req: NextRequest) {
  const { docContent, format } = await req.json()
  
  const zai = await ZAI.create()
  const analysis = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Analyze this documentation and extract:
1. Main topics and their subtopics
2. Key sections and their relationships
3. Technical terms that need definition
4. Recommended podcast structure (intro, deep dives, examples, conclusion)
5. Potential analogies and examples for each topic

Documentation content:
${docContent.substring(0, 10000)}`
      }
    ]
  })
  
  return NextResponse.json({
    success: true,
    topics: parseTopics(analysis.choices[0].message.content),
    structure: suggestStructure(analysis.choices[0].message.content),
    glossary: createGlossary(analysis.choices[0].message.content),
    recommendedEpisodes: generateEpisodePlan(analysis.choices[0].message.content)
  })
}
```

#### 1.3 Auto-Planning Agent
```typescript
// src/agents/auto-planning-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const autoPlanningAgent = createAgent({
  name: 'auto-planning-agent',
  description: 'Automatically plans podcast series from content',

  initialState: {
    episodes: [],
    seriesStructure: null,
    timeline: null,
    dependencies: []
  },

  tools: {
    planSeries: {
      description: 'Plan a multi-episode podcast series',
      parameters: {
        contentTopics: { type: 'array', description: 'Main content topics' },
        targetDuration: { type: 'number', description: 'Total duration in minutes' },
        episodesCount: { type: 'number', description: 'Number of episodes' }
      }
    },

    suggestTimeline: {
      description: 'Suggest optimal episode order and duration',
      parameters: {
        topics: { type: 'array' },
        complexity: { type: 'object' }
      }
    },

    identifyDependencies: {
      description: 'Identify which topics depend on others',
      parameters: {
        topics: { type: 'array' }
      }
    },

    generate大纲: {
      description: 'Generate detailed outline for each episode',
      parameters: {
        episode: { type: 'object', description: 'Episode metadata' }
      }
    }
  }
})
```

**Features:**
- Plan multi-episode series automatically
- Optimize episode order and duration
- Identify content dependencies
- Generate detailed episode outlines
- Create timeline and milestone tracking

**API Route:**
```typescript
// src/app/api/plan-series/route.ts
export async function POST(req: NextRequest) {
  const { contentTopics, targetDuration, episodesCount } = await req.json()
  
  const zai = await ZAI.create()
  const plan = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a podcast series planner. Create a ${targetDuration}-minute podcast series with ${episodesCount} episodes covering these topics:
${contentTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

For each episode, provide:
1. Title and subtitle
2. Recommended duration (in minutes)
3. Main topics to cover
4. Key takeaways
5. Suggested narrative structure
6. Dependencies on other episodes

Optimize for:
- Progressive complexity (start simple, get more complex)
- Logical topic flow
- Engaging storytelling structure
- Balance between entertainment and education`
      }
    ]
  })
  
  return NextResponse.json({
    success: true,
    seriesPlan: parsePlan(plan.choices[0].message.content),
    episodes: generateEpisodes(plan.choices[0].message.content),
    timeline: createTimeline(plan.choices[0].message.content),
    dependencies: identifyDependencies(plan.choices[0].message.content)
  })
}
```

### Task 2: Premium TTS Integration

**Goal:** Integrate ElevenLabs API for high-quality audio with voice cloning

#### 2.1 ElevenLabs SDK Integration
```typescript
// src/lib/elevenlabs.ts
import { ElevenLabsClient } from 'elevenlabs'

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
})

export async function generateAudio(text: string, voice: string, model: string = 'eleven_multilingual_v2') {
  const audio = await client.textToSpeech.convert({
    text,
    voice_id: voice,
    model_id: model,
    output_format: 'mp3_22050_256'
  })
  
  return {
    audioUrl: audio.audio.toString(),
    duration: audio.duration_seconds,
    size: audio.size_in_bytes,
    cost: calculateCost(audio.duration_seconds)
  }
}

export async function cloneVoice(audioFile: File) {
  const voice = await client.voices.add({
    files: [audioFile],
    description: 'Cloned podcast presenter voice'
  })
  
  return {
    voiceId: voice.voice_id,
    name: voice.name,
    labels: voice.labels
  }
}

export async function previewVoice(text: string, voice: string, duration: number = 15) {
  // Truncate text for preview duration
  const previewText = text.length > 500 
    ? text.substring(0, 500)
    : text
  
  const audio = await client.textToSpeech.convert({
    text: previewText,
    voice_id: voice,
    model_id: 'eleven_multilingual_v2'
  })
  
  return {
    audioUrl: audio.audio.toString(),
    duration: audio.duration_seconds,
    cost: calculateCost(audio.duration_seconds)
  }
}

function calculateCost(duration: number): number {
  // ElevenLabs pricing: ~$0.30 per 1000 characters
  const estimatedChars = duration * 150 // avg 150 chars per minute
  return (estimatedChars / 1000) * 0.30
}
```

**Features:**
- Generate high-quality audio with ElevenLabs
- Support multiple voice models (multilingual v1/v2)
- Voice cloning from uploaded audio samples
- 15-second preview generation for testing
- Cost estimation before generation
- MP3 output with 22.05kHz, 256kbps quality

**API Route:**
```typescript
// src/app/api/elevenlabs/generate/route.ts
import { generateAudio } from '@/lib/elevenlabs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, voice, useClone } = await req.json()
  
  try {
    // If voice cloning is requested, use cloned voice
    let targetVoice = voice
    if (useClone) {
      const clone = await cloneVoice(/* cloned voice ID */)
      targetVoice = clone.voiceId
    }
    
    const result = await generateAudio(text, targetVoice)
    
    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      duration: result.duration,
      cost: result.cost,
      provider: 'elevenlabs',
      model: 'eleven_multilingual_v2'
    })
  } catch (error) {
    console.error('ElevenLabs error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      provider: 'elevenlabs'
    }, { status: 500 })
  }
}
```

#### 2.2 Voice Management System
```typescript
// src/agents/voice-manager-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const voiceManagerAgent = createAgent({
  name: 'voice-manager-agent',
  description: 'Manages voice cloning and settings for podcast presenters',

  initialState: {
    localVoices: ['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo'],
    clonedVoices: {},
    presenterVoices: {
      presenter1: 'tongtong',
      presenter2: 'xiaochen'
    },
    defaultProvider: 'local',
    voiceSettings: {}
  },

  tools: {
    cloneVoice: {
      description: 'Clone a voice from uploaded audio sample',
      parameters: {
        presenter: { type: 'string', description: 'Which presenter (1 or 2)' },
        audioFile: { type: 'string', description: 'Base64 encoded audio file' },
        name: { type: 'string', description: 'Name for the cloned voice' }
      }
    },

    setVoice: {
      description: 'Set voice for a presenter',
      parameters: {
        presenter: { type: 'string' },
        voiceId: { type: 'string', description: 'Local or cloned voice ID' }
      }
    },

    previewVoice: {
      description: 'Generate 15-second preview of audio with current settings',
      parameters: {
        text: { type: 'string', description: 'Sample text to preview' },
        voiceId: { type: 'string' }
      }
    },

    compareVoices: {
      description: 'Compare multiple voices side by side',
      parameters: {
        text: { type: 'string' },
        voices: { type: 'array' }
      }
    },

    exportVoiceModel: {
      description: 'Export voice settings for backup',
      parameters: {
        format: { type: 'string' }
      }
    }
  }
})
```

**Features:**
- Clone voices from uploaded audio samples
- Manage multiple presenter voices
- Test voices with 15-second previews
- Compare voices side by side
- Export voice configurations
- Mix and match voice settings for segments

### Task 3: Web Scraping Integration

**Goal:** Extract content from URLs using Firecrawl and Crawl4AI APIs

#### 3.1 Firecrawl API Integration
```typescript
// src/lib/firecrawl.ts
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

export async function scrapeUrl(url: string, options = {}) {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      timeout: 30000,
      ...options
    })
  })
  
  if (!response.ok) {
    throw new Error(`Firecrawl error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  return {
    markdown: data.markdown,
    metadata: data.metadata,
    wordCount: data.metadata?.wordCount || 0,
    title: data.metadata?.title || '',
    links: data.metadata?.links || []
  }
}

export async function crawlUrl(url: string, maxPages = 10) {
  const response = await fetch('https://api.firecrawl.dev/v1/crawl', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      limit: maxPages,
      formats: ['markdown'],
      onlyMainContent: true,
      ignoreBase64Images: true
    })
  })
  
  if (!response.ok) {
    throw new Error(`Firecrawl error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  return {
    markdown: data.markdown,
    pages: data.data.map((page: any) => ({
      markdown: page.markdown,
      url: page.url,
      metadata: page.metadata
    })),
    totalPages: data.totalPages
  }
}
```

**Features:**
- Scrape single URLs and get clean markdown
- Crawl entire websites with multiple pages
- Extract metadata, links, and word counts
- Support various content types (articles, blogs, docs)
- Configurable timeout and depth

**API Route:**
```typescript
// src/app/api/scrape-url/route.ts
import { scrapeUrl, crawlUrl } from '@/lib/firecrawl'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url, crawl, maxPages } = await req.json()
  
  try {
    let result
    if (crawl) {
      result = await crawlUrl(url, maxPages || 10)
    } else {
      result = await scrapeUrl(url)
    }
    
    return NextResponse.json({
      success: true,
      content: result.markdown,
      metadata: result.metadata,
      links: result.links,
      pages: result.pages || [],
      totalPages: result.totalPages || 1
    })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

#### 3.2 Crawl4AI Integration (User-Authenticated Pages)
```typescript
// src/lib/crawl4ai.ts
const CRAWL4AI_API_KEY = process.env.CRAWL4AI_API_KEY

export async function scrapeAuthenticatedUrl(url: string, credentials: { username, password }) {
  const response = await fetch('https://api.crawl4ai.com/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRAWL4AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      waitFor: 2000,
      ...credentials
    })
  })
  
  if (!response.ok) {
    throw new Error(`Crawl4AI error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  return {
    markdown: data.markdown,
    html: data.html,
    screenshot: data.screenshot,
    metadata: data.metadata
  }
}
```

**Features:**
- Scrape user-authenticated pages (paywall, logins)
- Generate screenshots for preview
- Extract both HTML and markdown
- Handle JavaScript-rendered content
- Support cookies and sessions

### Task 4: MCP (Model Context Protocol) Extensions

**Goal:** Extend agent capabilities with MCP servers

#### 4.1 MCP Client Implementation
```typescript
// src/lib/mcp-client.ts
import { Client } from '@modelcontextprotocol/typescript-sdk'

export class MCPClients {
  private clients: Map<string, Client> = new Map()
  
  async connect(serverConfig: { name: string; transport: string; url: string }) {
    const client = new Client({
      name: serverConfig.name,
      version: '1.0.0'
    })
    
    await client.connect(serverConfig.transport, serverConfig.url)
    this.clients.set(serverConfig.name, client)
    
    console.log(`Connected to MCP server: ${serverConfig.name}`)
    return client
  }
  
  async callTool(serverName: string, toolName: string, args: any) {
    const client = this.clients.get(serverName)
    if (!client) {
      throw new Error(`MCP client ${serverName} not connected`)
    }
    
    const result = await client.callTool({
      name: toolName,
      arguments: args
    })
    
    return result
  }
  
  async listTools(serverName: string) {
    const client = this.clients.get(serverName)
    if (!client) {
      throw new Error(`MCP client ${serverName} not connected`)
    }
    
    const tools = await client.listTools()
    return tools
  }
  
  async disconnect(serverName: string) {
    const client = this.clients.get(serverName)
    if (client) {
      await client.close()
      this.clients.delete(serverName)
    }
  }
}

// Create singleton instance
export const mcpClients = new MCPClients()
```

#### 4.2 MCP Servers Integration
```typescript
// src/mcp/servers.ts
export const MCP_SERVERS = {
  // File system MCP server
  'filesystem': {
    name: 'filesystem',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-filesystem'
  },
  
  // GitHub MCP server
  'github': {
    name: 'github',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-github'
  },
  
  // PostgreSQL MCP server
  'postgres': {
    name: 'postgres',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-postgres'
  },
  
  // Custom MCP server for project files
  'project-files': {
    name: 'project-files',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-filesystem /home/z/my-project'
  }
}
```

**Features:**
- Connect to multiple MCP servers simultaneously
- List available tools from each server
- Call tools with proper type safety
- Manage MCP client lifecycle
- Extend agent capabilities with external tools

**API Route:**
```typescript
// src/app/api/mcp/call-tool/route.ts
import { mcpClients } from '@/lib/mcp-client'

export async function POST(req: NextRequest) {
  const { serverName, toolName, args } = await req.json()
  
  try {
    // Ensure MCP server is connected
    const serverConfig = MCP_SERVERS[serverName]
    if (!mcpClients.clients.get(serverName)) {
      await mcpClients.connect(serverConfig)
    }
    
    // Call tool
    const result = await mcpClients.callTool(serverName, toolName, args)
    
    return NextResponse.json({
      success: true,
      result,
      toolName,
      serverName
    })
  } catch (error) {
    console.error('MCP tool call error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      serverName,
      toolName
    }, { status: 500 })
  }
}
```

## 📋 Advanced Features Tasks

### Priority 1: Code Scanning & Documentation Parsing
- [ ] Create code-analysis-agent.ts
- [ ] Create doc-analysis-agent.ts
- [ ] Implement code scanning API route
- [ ] Implement documentation parsing API route
- [ ] Add file upload handling for various formats
- [ ] Test with Python, JavaScript, TypeScript files

### Priority 2: Auto-Planning Series Generator
- [ ] Create auto-planning-agent.ts
- [ ] Implement series planning API route
- [ ] Add episode duration optimization
- [ ] Implement dependency tracking
- [ ] Create timeline visualization component
- [ ] Test multi-episode series planning

### Priority 3: ElevenLabs Premium TTS
- [ ] Create elevenlabs.ts library
- [ ] Create voice-manager-agent.ts
- [ ] Implement voice generation API route
- [ ] Implement voice cloning API route
- [ ] Implement 15-second preview API route
- [ ] Add cost estimation display
- [ ] Test voice cloning from audio samples

### Priority 4: Web Scraping with Firecrawl
- [ ] Create firecrawl.ts library
- [ ] Create crawl4ai.ts library for auth pages
- [ ] Implement URL scraping API route
- [ ] Implement crawling API route
- [ ] Add content filtering and cleanup
- [ ] Test with various websites and content types

### Priority 5: MCP Extensions
- [ ] Create mcp-client.ts
- [ ] Create mcp/servers.ts config
- [ ] Implement MCP connection management
- [ ] Implement MCP tool calling API route
- [ ] Integrate with filesystem and GitHub servers
- [ ] Test tool calling and error handling

## 🎯 Success Criteria for Phase 3

Phase 3 is complete when:

1. ✅ **Advanced Content Analysis**
   - Code scanning works for multiple languages
   - Documentation parsing supports multiple formats
   - Auto-planning generates podcast series
   - Extracts themes and topics automatically

2. ✅ **Premium TTS Integration**
   - ElevenLabs API integrated and working
   - Voice cloning from audio samples works
   - 15-second previews generate correctly
   - Cost estimation displays before generation
   - Production-quality MP3 audio export

3. ✅ **Web Scraping**
   - Firecrawl API integration works
   - Crawl4AI handles authenticated pages
   - Content extraction from URLs works reliably
   - Support for multiple pages and crawling

4. ✅ **MCP Extensions**
   - Multiple MCP servers can connect
   - Tool calling works with type safety
   - Filesystem, GitHub, and PostgreSQL tools integrated
   - Agent capabilities extended with external tools

## 📚 Resources

### Documentation
- ElevenLabs: https://elevenlabs.io/docs
- Firecrawl: https://docs.firecrawl.dev
- Crawl4AI: https://docs.crawl4ai.com
- MCP Protocol: https://modelcontextprotocol.io
- React Markdown: https://github.com/remarkjs/react-markdown

### Time Estimates

- **Code Scanning & Docs Parsing**: 12-16 hours
- **Auto-Planning System**: 8-12 hours
- **ElevenLabs Integration**: 10-14 hours
- **Web Scraping Integration**: 8-12 hours
- **MCP Extensions**: 6-10 hours
- **Testing & Refinement**: 8-12 hours

**Total Phase 3: 52-64 hours**

## 🚀 Next: Phase 4 Planning

After Phase 3, we'll implement:
1. **Standalone Executable Version**
   - Electron + Next.js bundler
   - Folder scanning and file watching
   - Config wizard for first-run setup
   - Dual config system (API keys separate from instructions)

2. **Multi-User Collaboration**
   - Shared workspaces for teams
   - Cloud storage and sync
   - Version control for scripts
   - Real-time collaborative editing
   - Role-based access control

3. **Enterprise Features**
   - Team workspace management
   - Billing and API usage tracking
   - Analytics and listener feedback
   - White-label deployment options
   - Admin dashboard

Let's build the most advanced podcast creation platform! 🚀
