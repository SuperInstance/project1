import { createAgent } from '@copilotkit/react-core'

export interface PodcastState {
  mode: 'operational' | 'podcast'
  script: string
  segments: Array<{
    id: string
    text: string
    audioUrl?: string
  }>
  themes: string[]
}

const initialState: PodcastState = {
  mode: 'podcast',
  script: '',
  segments: [],
  themes: []
}

export const podcastAgent = createAgent({
  name: 'podcast-agent',
  description: 'Creates and manages podcast content including scripts, outlines, and audio segments',

  initialState,

  // Define the tool functions the agent can call
  tools: {
    updateScript: {
      description: 'Updates the podcast script in the editor',
      parameters: {
        content: { type: 'string', description: 'The script content to set' }
      }
    },
    
    generateScript: {
      description: 'Generates a complete podcast script based on topic',
      parameters: {
        topic: { type: 'string', description: 'The topic for the podcast episode' },
        audience: { type: 'string', description: 'Target audience for the podcast' }
      }
    },

    analyzeContent: {
      description: 'Analyzes uploaded content and extracts key themes',
      parameters: {
        content: { type: 'string', description: 'The content to analyze' }
      }
    },

    setMode: {
      description: 'Switches between operational and podcast mode',
      parameters: {
        mode: { type: 'string', description: 'operational or podcast' }
      }
    }
  }
})

// Export for use in frontend
export type { PodcastAgent } = typeof podcastAgent
