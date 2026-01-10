# Phase 2: Full Agent-Native Implementation Plan

## 🎯 Objective

Transform Podcast Maker from AI-assisted to **true agent-native** with:
- Multi-agent orchestration (LangGraph)
- Human-in-the-loop approvals
- Realtime agent actions and state streaming
- Agentic generative UI (show agent thinking)
- Advanced content analysis capabilities

## 📊 Architecture Overview

### Current vs Target Architecture

```
【Current: AI-Assisted with Agent-Native Features】
User → Chatbot → API (z-ai-web-dev-sdk) → LLM → Response → Manual UI Updates
                                              ↓
                                        No multi-agent coordination
                                        No agent-to-agent communication
                                        No state streaming
```

```
【Target: Agent-Native with LangGraph Multi-Agent System】
User ↔ Shared State (CopilotKit) ↔ Agent Orchestator (LangGraph)
                                              ↓
        ├─→ ContentAnalysisAgent (File scanning & theme extraction)
        ├─→ ScriptAgent (Script writing & refinement)
        ├─→ AudioAgent (TTS management & segment generation)
        └─→ MetaAgent (System awareness & operational guidance)
                                              ↓
Agent State Streaming → Agentic UI (Real-time visible)
Human-in-the-Loop → Approvals before expensive operations
Realtime Frontend Actions → Agent triggers UI functions directly
```

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|--------|
| **LangGraph** | Multi-agent orchestration | ^0.2.48 |
| **CopilotKit** | Agent-native frontend framework | ^1.5.0 |
| **ElevenLabs SDK** | Premium TTS integration | ^0.8.0 |
| **Firecrawl API** | Web scraping & content extraction | Latest |
| **MCP (Model Context Protocol)** | Extending agent capabilities | Latest |
| **React Markdown** | Script parsing & rendering | ^9.0.0 |

## 🚀 Implementation Roadmap

### Task 1: Create Multi-Agent System

**Goal:** Implement specialized agents for different podcast creation tasks

#### 1.1 Content Analysis Agent
```typescript
// src/agents/content-analysis-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const contentAnalysisAgent = createAgent({
  name: 'content-analysis-agent',
  description: 'Analyzes uploaded files and extracts themes/topics',

  initialState: {
    analyzedFiles: [],
    extractedThemes: [],
    currentStatus: 'idle'
  },

  tools: {
    analyzeFile: {
      description: 'Analyze a single uploaded file',
      parameters: {
        fileName: { type: 'string' },
        fileContent: { type: 'string' }
      }
    },
    
    scanFolder: {
      description: 'Scan a folder for podcast-relevant files',
      parameters: {
        folderPath: { type: 'string' }
      }
    },
    
    extractThemes: {
      description: 'Extract key themes from analyzed content',
      parameters: {
        content: { type: 'string' }
      }
    }
  }
})
```

**Features:**
- Analyze uploaded files (markdown, docs, code)
- Extract key topics, themes, and narratives
- Suggest podcast episode structures
- Identify technical vs. conversational content
- Generate content summaries

**API Routes Needed:**
```typescript
// src/app/api/analyze-content/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { files, options } = await req.json()
  
  // Use z-ai-web-dev-sdk LLM skill to analyze content
  const zai = await ZAI.create()
  
  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a content analysis expert. Extract key themes, topics, and suggest podcast structures from the provided content.'
      },
      {
        role: 'user',
        content: `Analyze this content and suggest podcast episodes:\n\n${files.map(f => f.name + ': ' + f.content).join('\n\n')}`
      }
    ],
    thinking: { type: 'disabled' }
  })
  
  return NextResponse.json({
    themes: [],
    suggestedEpisodes: [],
    analyzedFiles: files.map(f => f.name)
  })
}
```

#### 1.2 Script Agent
```typescript
// src/agents/script-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const scriptAgent = createAgent({
  name: 'script-agent',
  description: 'Writes and refines podcast scripts',

  initialState: {
    currentScript: '',
    scriptSections: [],
    outline: null,
    tone: 'professional',
    audience: 'general'
  },

  tools: {
    generateOutline: {
      description: 'Generate podcast episode outline',
      parameters: {
        topic: { type: 'string' },
        duration: { type: 'number', description: 'Duration in minutes' },
        audience: { type: 'string', description: 'Target audience' }
      }
    },
    
    writeSection: {
      description: 'Write a specific section of the script',
      parameters: {
        section: { type: 'string', description: 'Section name (intro, main, conclusion)' },
        content: { type: 'string', description: 'Content to include' },
        presenter: { type: 'string', description: 'Who is speaking (1 or 2)' }
      }
    },
    
    refineScript: {
      description: 'Refine existing script based on feedback',
      parameters: {
        script: { type: 'string' },
        feedback: { type: 'string', description: 'User feedback or suggestions' },
        section: { type: 'string', description: 'Specific section to refine' }
      }
    },
    
    addExamples: {
      description: 'Add examples or analogies to script',
      parameters: {
        section: { type: 'string', description: 'Section to add example to' },
        topic: { type: 'string', description: 'Topic to create example for' }
      }
    },
    
    adjustTone: {
      description: 'Adjust tone of specific section',
      parameters: {
        section: { type: 'string' },
        tone: { type: 'string', description: 'enthusiastic, serious, casual, etc.' }
      }
    }
  }
})
```

**Features:**
- Generate episode outlines from topics
- Write script sections (intro, body, conclusion)
- Add examples and analogies
- Refine scripts based on user feedback
- Adjust tone for different sections
- Support multiple presenters
- Add pacing and delivery directions

**API Routes Needed:**
```typescript
// src/app/api/generate-outline/route.ts
export async function POST(req: NextRequest) {
  const { topic, duration, audience } = await req.json()
  
  const zai = await ZAI.create()
  
  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are an expert podcast script writer. Create a ${duration}-minute outline about "${topic}" for ${audience} audience.`
      }
    ],
    thinking: { type: 'disabled' }
  })
  
  return NextResponse.json({
    outline: parseOutline(response.choices[0].message.content)
  })
}
```

#### 1.3 Audio Agent
```typescript
// src/agents/audio-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const audioAgent = createAgent({
  name: 'audio-agent',
  description: 'Manages TTS generation, audio segments, and voice settings',

  initialState: {
    segments: [],
    generatedAudio: {},
    currentVoice: 'tongtong',
    audioSettings: {
      speed: 1.0,
      volume: 1.0,
      format: 'wav'
    }
  },

  tools: {
    generateSegment: {
      description: 'Generate audio for a specific segment',
      parameters: {
        segmentId: { type: 'string' },
        text: { type: 'string', description: 'Text to convert (max 1024 chars)' },
        voice: { type: 'string', description: 'Voice to use' },
        usePremium: { type: 'boolean', description: 'Use ElevenLabs or local TTS' }
      }
    },
    
    regenerateSegment: {
      description: 'Regenerate audio for a segment with new settings',
      parameters: {
        segmentId: { type: 'string' },
        newVoice: { type: 'string' },
        newSpeed: { type: 'number' },
        newVolume: { type: 'number' }
      }
    },
    
    batchGenerate: {
      description: 'Generate audio for all segments',
      parameters: {
        segments: { type: 'array', description: 'Array of segment objects' },
        voiceMapping: { type: 'object', description: 'Map of presenter to voice' }
      }
    },
    
    mixAudio: {
      description: 'Mix multiple audio segments into single file',
      parameters: {
        segments: { type: 'array' },
        transitions: { type: 'array', description: 'Transition audio between segments' }
      }
    },
    
    exportAudio: {
      description: 'Export podcast in specified format',
      parameters: {
        format: { type: 'string', description: 'mp3, wav, or pcm' },
        quality: { type: 'string', description: 'high, medium, or low' }
      }
    }
  }
})
```

**Features:**
- Generate individual segment audio (local or ElevenLabs)
- Regenerate segments with different voices/settings
- Batch generate all segments
- Mix audio segments with transitions
- Export in multiple formats
- Manage voice configurations per presenter

**API Routes Needed:**
```typescript
// src/app/api/audio/generate-segment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: NextRequest) {
  const { segmentId, text, voice, usePremium } = await req.json()
  
  if (usePremium) {
    // Use ElevenLabs API
    const elevenLabsAudio = await generateWithElevenLabs(text, voice)
    return NextResponse.json({
      audioUrl: elevenLabsAudio.url,
      provider: 'elevenlabs',
      cost: calculateCost(text)
    })
  }
  
  // Use z-ai-web-dev-sdk TTS skill (local)
  const zai = await ZAI.create()
  const response = await zai.audio.tts.create({
    input: text.substring(0, 1024),
    voice: voice,
    speed: 1.0,
    response_format: 'wav',
    stream: false
  })
  
  // Save audio file
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(new Uint8Array(arrayBuffer))
  const filename = `segment_${segmentId}_${Date.now()}.wav`
  await writeFile(`./public/audio/${filename}`, buffer)
  
  return NextResponse.json({
    audioUrl: `/audio/${filename}`,
    provider: 'local',
    cost: 0
  })
}
```

#### 1.4 Meta Agent
```typescript
// src/agents/meta-agent.ts
import { createAgent } from '@copilotkit/react-core'

export const metaAgent = createAgent({
  name: 'meta-agent',
  description: 'Handles system awareness, operational questions, and application guidance',

  initialState: {
    systemMode: 'idle',
    userGuidanceHistory: [],
    featuresExplained: new Set()
  },

  tools: {
    explainFeature: {
      description: 'Explain how a specific feature works',
      parameters: {
        feature: { type: 'string', description: 'Feature name' },
        context: { type: 'string', description: 'Additional context' }
      }
    },
    
    guideWorkflow: {
      description: 'Guide user through a specific workflow',
      parameters: {
        workflow: { type: 'string', description: 'Name of workflow' },
        step: { type: 'number', description: 'Current step number' }
      }
    },
    
    detectMode: {
      description: 'Detect user intent (operational vs podcast mode)',
      parameters: {
        userInput: { type: 'string' }
      },
      returns: {
        mode: { type: 'string' },
        confidence: { type: 'number' }
      }
    },
    
    provideTips: {
      description: 'Provide helpful tips based on user behavior',
      parameters: {
        context: { type: 'string', description: 'Current task or issue' }
      }
    }
  }
})
```

**Features:**
- Explain system features and capabilities
- Guide users through workflows
- Detect conversation mode (operational vs podcast)
- Provide contextual tips
- Maintain user guidance history

### Task 2: Implement Agent Orchestration

**Goal:** Create LangGraph workflow to coordinate multiple agents

#### 2.1 LangGraph Workflow Definition
```typescript
// src/agents/workflow/podcast-workflow.ts
import { StateGraph, END } from '@langchain/langgraph'
import { contentAnalysisAgent } from '../content-analysis-agent'
import { scriptAgent } from '../script-agent'
import { audioAgent } from '../audio-agent'
import { metaAgent } from '../meta-agent'

// Define state structure
interface PodcastState {
  topic: string
  files: Array<{ name: string; content: string }>
  outline: any
  script: string
  audioSegments: Array<{ id: string; audioUrl: string }>
  currentStep: string
  status: 'planning' | 'analyzing' | 'writing' | 'generating' | 'complete'
  userApprovals: Record<string, boolean>
}

// Create workflow graph
const podcastWorkflow = new StateGraph<PodcastState>({
  channels: {
    input: 'user_input',
    planning: 'plan',
    analysis: 'analyzed_content',
    outline: 'episode_outline',
    script: 'podcast_script',
    audio: 'generated_audio',
    export: 'final_podcast',
    currentStep: 'workflow_step',
    status: 'current_status',
    userApprovals: 'pending_approvals'
  }
})

// Add nodes (agent functions)
podcastWorkflow
  .addNode('analyze_content', contentAnalysisAgent.tools.analyzeFile)
  .addNode('create_outline', scriptAgent.tools.generateOutline)
  .addNode('write_script', scriptAgent.tools.writeSection)
  .addNode('generate_audio', audioAgent.tools.generateSegment)
  .addNode('mix_audio', audioAgent.tools.mixAudio)
  .addNode('complete', metaAgent.tools.explainFeature)

// Add edges (workflow transitions)
podcastWorkflow
  .addEdge('start', 'analyze_content')
  .addEdge('analyze_content', 'create_outline')
  .addEdge('create_outline', 'write_script')
  .addEdge('write_script', 'generate_audio')
  .addEdge('generate_audio', 'mix_audio')
  .addEdge('mix_audio', 'complete')

// Set entry and exit points
podcastWorkflow.setEntryPoint('start')
podcastWorkflow.setFinishPoint('complete')

// Compile workflow
const app = podcastWorkflow.compile()

export { app, PodcastState }
```

#### 2.2 LangGraph Backend Server
```typescript
// src/app/api/workflow/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { app } from '@/agents/workflow/podcast-workflow'

export async function POST(req: NextRequest) {
  const { topic, files, userIntent } = await req.json()
  
  // Create config with initial state
  const config = {
    configurable: {
      thread_id: 'podcast_' + Date.now(),
      recursion_limit: 10
    },
    stream_mode: 'values',
  }
  
  try {
    // Invoke workflow
    const result = await app.invoke({
      topic: topic || 'General podcast',
      files: files || [],
      currentStep: 'start',
      status: 'planning',
      userApprovals: {}
    }, config)
    
    // Stream events to frontend
    return NextResponse.json({
      success: true,
      workflowId: config.configurable.thread_id,
      currentStep: result.currentStep,
      status: result.status,
      state: result
    })
  } catch (error) {
    console.error('Workflow error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
```

**Features:**
- Multi-step workflow with state persistence
- Agent-to-agent coordination
- Checkpoint recovery for reliability
- Streaming state updates to frontend
- Error handling and retry logic

### Task 3: Implement Human-in-the-Loop

**Goal:** Add approval dialogs for expensive operations

#### 3.1 Approval Action Hook
```typescript
// src/hooks/useApprovalAction.ts
import { useCopilotAction } from '@copilotkit/react-core'

export function useApprovalAction<T extends Record<string, any>>(options: {
  name: string
  description: string
  operation: (args: T) => Promise<{ success: boolean; result?: any }>
  cost?: number
}) {
  return useCopilotAction({
    name: `approve_${name}`,
    description: options.description,
    parameters: Object.keys(options).map(key => ({
      name: key,
      type: typeof options[key as keyof T]
    })),
    renderAndWait: ({ args, handler }) => (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Operation</DialogTitle>
            <DialogDescription>
              {options.description}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {options.cost && (
              <Alert variant="default" className="mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Estimated Cost: ${options.cost.toFixed(2)}</span>
                </div>
                <AlertDescription>
                  This will use ElevenLabs premium TTS API. Cost is approximately ${options.cost.toFixed(2)} USD.
                </AlertDescription>
              </Alert>
            )}
            <p>Would you like to proceed?</p>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => handler({ ...args, approved: true })}>
              Approve
            </Button>
            <Button variant="outline" onClick={() => handler({ ...args, approved: false })}>
              Deny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    handler: async (args) => {
      if (args.approved) {
        // Execute operation
        const result = await options.operation(args)
        return { success: true, result }
      }
      
      return { success: false, denied: true }
    }
  })
}
```

**Features:**
- Cost estimation for premium operations
- Clear approve/deny workflow
- Warning messages for irreversible operations
- Integration with CopilotKit actions

**Usage Example:**
```typescript
// Approve expensive operations
const approveFullGeneration = useApprovalAction({
  name: 'full_generation',
  description: 'Generate full episode with paid TTS (~$2.50)',
  operation: async ({ usePremium }) => {
    // Call ElevenLabs API
    const audio = await generateWithElevenLabs(script, voice)
    return { success: true, audio }
  },
  cost: 2.50 // Estimated cost in USD
})
```

### Task 4: Implement Agentic Generative UI

**Goal:** Show agent's thinking process and current actions in real-time

#### 4.1 Agent State Component
```typescript
// src/components/agent-state-display.tsx
'use client'

import { useCoAgent } from '@copilotkit/react-core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cpu, Loader2, CheckCircle, AlertCircle, Play, Stop } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function AgentStateDisplay() {
  const { state } = useCoAgent('podcast-agent')
  
  const getStatusIcon = () => {
    if (state.status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />
    if (state.status === 'in_progress') return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    if (state.status === 'error') return <AlertCircle className="h-5 w-5 text-red-500" />
    return <Cpu className="h-5 w-5 text-yellow-500 animate-pulse" />
  }
  
  const getStatusText = () => {
    if (state.currentAction) return state.currentAction
    if (state.status === 'completed') return 'Completed'
    if (state.status === 'in_progress') return 'Processing...'
    return 'Ready'
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <span>Agent State</span>
          <Badge variant="secondary">
            {state.mode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Action */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="font-medium">{getStatusText()}</p>
              {state.currentStep && (
                <p className="text-sm text-muted-foreground">
                  Step: {state.currentStep}
                </p>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={state.progress || 0} className="w-full" />
          
          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge variant={state.status === 'completed' ? 'default' : 'secondary'}>
                {state.status}
              </Badge>
            </div>
            
            {state.estimatedTime && (
              <div className="flex justify-between">
                <span>ETA:</span>
                <span>{state.estimatedTime}s</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Features:**
- Real-time agent state display
- Progress indicators
- Current action visibility
- Step tracking in workflows
- Status badges (completed, in progress, error)

#### 4.2 Streaming Events to Frontend
```typescript
// src/lib/agent-streaming.ts
export interface AgentEvent {
  type: 'state_update' | 'action_started' | 'action_completed' | 'error' | 'checkpoint'
  data: any
  timestamp: number
}

export function sendAgentEvent(event: AgentEvent) {
  // Send to all connected clients
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('agent-event', { detail: event }))
  }
}

export function useAgentEvents(callback: (event: AgentEvent) => void) {
  useEffect(() => {
    const handler = (e: CustomEvent) => callback(e.detail)
    window.addEventListener('agent-event', handler)
    
    return () => {
      window.removeEventListener('agent-event', handler)
    }
  }, [])
}
```

**Features:**
- Event-driven architecture
- Real-time state synchronization
- Cross-component communication
- Checkpoint notifications
- Error handling

### Task 5: Realtime Frontend Actions

**Goal:** Enable agents to trigger UI functions directly

#### 5.1 Action Registry
```typescript
// src/lib/action-registry.ts
import { toast } from 'sonner'

type ActionHandler = (args: any) => Promise<any>

const actionRegistry: Record<string, ActionHandler> = {
  // Script actions
  'updateScript': async ({ content }) => {
    // Update script editor
    document.dispatchEvent(new CustomEvent('update-script', { detail: content }))
    return { success: true }
  },
  
  'selectText': async ({ start, end }) => {
    // Select text in editor
    document.dispatchEvent(new CustomEvent('select-text', { detail: { start, end } }))
    return { success: true }
  },
  
  // Audio actions
  'playSegment': async ({ segmentId }) => {
    // Play audio segment
    document.dispatchEvent(new CustomEvent('play-segment', { detail: { segmentId } }))
    return { success: true }
  },
  
  'generateAudio': async ({ segmentId, options }) => {
    // Trigger audio generation
    document.dispatchEvent(new CustomEvent('generate-audio', { detail: { segmentId, options } }))
    return { success: true }
  },
  
  'mixAudio': async ({ segments }) => {
    // Mix audio segments
    document.dispatchEvent(new CustomEvent('mix-audio', { detail: { segments } }))
    return { success: true }
  },
  
  'exportAudio': async ({ format, quality }) => {
    // Trigger export
    document.dispatchEvent(new CustomEvent('export-audio', { detail: { format, quality } }))
    return { success: true }
  },
  
  // UI actions
  'showToast': async ({ message, type = 'success' }) => {
    // Show toast notification
    toast[type](message)
    return { success: true }
  },
  
  'openDialog': async ({ dialogType, props }) => {
    // Open specific dialog
    document.dispatchEvent(new CustomEvent('open-dialog', { detail: { type: dialogType, props } }))
    return { success: true }
  },
  
  // Agent actions
  'setThinking': async ({ isThinking, details }) => {
    // Update agent thinking state
    document.dispatchEvent(new CustomEvent('agent-thinking', { detail: { isThinking, details } }))
    return { success: true }
  },
  
  'updateProgress': async ({ progress }) => {
    // Update progress bar
    document.dispatchEvent(new CustomEvent('update-progress', { detail: { progress } }))
    return { success: true }
  }
}

export default actionRegistry
```

**Features:**
- Agent can trigger UI updates directly
- Script editor updates automatic
- Audio playback controlled by agents
- Toast notifications from agents
- Event-driven architecture

#### 5.2 Agent Actions Integration
```typescript
// src/agents/podcast-agent.ts (enhanced)
import { createAgent } from '@copilotkit/react-core'
import actionRegistry from '@/lib/action-registry'

export const podcastAgent = createAgent({
  name: 'podcast-agent',
  description: 'Orchestrates podcast creation with UI actions',
  
  tools: {
    // Enhanced tools that trigger UI actions
    updateScriptEditor: {
      description: 'Update script in editor',
      parameters: { content: { type: 'string' } },
      handler: async ({ content }) => {
        return actionRegistry.updateScript({ content })
      }
    },
    
    playAudioSegment: {
      description: 'Play a specific audio segment',
      parameters: { segmentId: { type: 'string' } },
      handler: async ({ segmentId }) => {
        return actionRegistry.playSegment({ segmentId })
      }
    },
    
    generateAllAudio: {
      description: 'Generate audio for all segments',
      parameters: { segments: { type: 'array' } },
      handler: async ({ segments }) => {
        const results = await Promise.all(
          segments.map(seg => actionRegistry.generateAudio({ segmentId: seg.id, text: seg.text }))
        )
        return { success: true, results }
      }
    },
    
    showNotification: {
      description: 'Show a toast notification',
      parameters: { message: { type: 'string' }, type: { type: 'string' } },
      handler: async ({ message, type }) => {
        return actionRegistry.showToast({ message, type })
      }
    },
    
    requestApproval: {
      description: 'Request user approval for expensive operation',
      parameters: { operation: { type: 'string' }, cost: { type: 'number' } },
      handler: async ({ operation, cost }) => {
        return actionRegistry.openDialog({ 
          dialogType: 'approval', 
          props: { operation, cost } 
        })
      }
    }
  }
})
```

**Features:**
- Agents can trigger UI updates directly
- Script editor updates automatic
- Audio playback controlled by agents
- Toast notifications from agents
- Dialog management
- Event-driven architecture

## 📅 Implementation Tasks

### Priority 1: Create Multi-Agent System
- [ ] Create content-analysis-agent.ts
- [ ] Create script-agent.ts
- [ ] Create audio-agent.ts
- [ ] Create meta-agent.ts
- [ ] Define agent interfaces and types
- [ ] Test individual agents
- [ ] Create API routes for each agent
- [ ] Integrate with z-ai-web-dev-sdk

### Priority 2: Implement Agent Orchestration
- [ ] Create podcast-workflow.ts with LangGraph
- [ ] Define workflow state structure
- [ ] Add workflow nodes and edges
- [ ] Create workflow API endpoint
- [ ] Test workflow execution
- [ ] Implement state streaming
- [ ] Add checkpoint recovery

### Priority 3: Implement Human-in-the-Loop
- [ ] Create useApprovalAction hook
- [ ] Create ApprovalDialog component
- [ ] Integrate with audio generation
- [ ] Add cost estimation
- [ ] Test approval flows
- [ ] Add undo/redo for reversible ops

### Priority 4: Implement Agentic Generative UI
- [ ] Create AgentStateDisplay component
- [ ] Create streaming event system
- [ ] Add progress indicators
- [ ] Create ActionRegistry
- [ ] Integrate with existing UI
- [ ] Add visual feedback for all agent actions

### Priority 5: Test & Refine
- [ ] End-to-end testing of multi-agent system
- [ ] Test human-in-the-loop flows
- [ ] Test agent-to-agent communication
- [ ] Test UI action triggers
- [ ] Performance optimization
- [ ] Error handling improvements

## 🎯 Success Criteria for Phase 2

Phase 2 is complete when:

1. ✅ **Multi-Agent System**
   - At least 3 specialized agents (content, script, audio)
   - Agents can communicate and delegate tasks
   - Each agent has clear responsibilities

2. ✅ **LangGraph Orchestration**
   - Multi-step workflow defined
   - State management across workflow
   - Checkpoint recovery implemented
   - Streaming events to frontend

3. ✅ **Human-in-the-Loop**
   - Approval dialogs for expensive operations
   - Cost estimation
   - Clear approve/deny workflow
   - Cannot undo irreversible operations

4. ✅ **Agentic Generative UI**
   - Agent's thinking visible to users
   - Real-time state updates
   - Progress indicators
   - Visual feedback for all actions

5. ✅ **Realtime Frontend Actions**
   - Agents can trigger UI functions
   - Script editor updates automatically
   - Audio playback controlled by agents
   - Toast notifications from agents
   - Direct agent-to-UI communication

## 🚀 Next: Phase 3 Planning

After completing Phase 2, we'll move to Phase 3:

1. **Advanced Content Analysis**
   - Code scanning and documentation parsing
   - Automatic topic detection
   - Episode series planning
   - Research and fact-checking

2. **Premium TTS Integration**
   - ElevenLabs API integration
   - Voice cloning capabilities
   - 15-second preview generation
   - Production-quality audio export

3. **Web Scraping Integration**
   - MCP servers: Firecrawl, Crawl4AI
   - User-authenticated page support
   - Headless scraping options
   - Content analysis from URLs

## 📚 Resources

### Documentation
- LangGraph Docs: https://docs.langchain.com/langgraph
- CopilotKit Docs: https://docs.copilotkit.ai
- ElevenLabs Docs: https://elevenlabs.io/docs/overview/capabilities/text-to-speech
- Firecrawl Docs: https://docs.firecrawl.dev

### Code Examples
- LangGraph tutorials in `/src/agents/workflow/`
- Agent patterns in `/src/agents/`
- UI components in `/src/components/`

### Time Estimates

- **Task 1 (Multi-Agent System)**: 8-12 hours
- **Task 2 (Agent Orchestration)**: 12-16 hours
- **Task 3 (Human-in-the-Loop)**: 6-8 hours
- **Task 4 (Agentic UI)**: 8-10 hours
- **Task 5 (Testing & Refine)**: 4-6 hours

**Total Phase 2: 38-52 hours**

## 🎓 Implementation Order

1. **Create Multi-Agent System** → Start with content-analysis-agent
2. **Implement Agent Orchestration** → Build workflow after agents tested
3. **Implement Human-in-the-Loop** → Add after workflow is stable
4. **Implement Agentic UI** → Add after agents are working
5. **Test & Refine** → Final validation and optimization

Let's start building true agent-native podcast maker! 🚀
