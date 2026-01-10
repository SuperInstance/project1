// Simple agent wrapper for podcast maker
// This provides agent-native features without requiring complex backend setup

import { createAgent } from '@copilotkit/react-core'

export interface PodcastState {
  mode: 'operational' | 'podcast'
  script: string
  isProcessing: boolean
}

const initialState: PodcastState = {
  mode: 'podcast',
  script: '',
  isProcessing: false
}

export const podcastAgent = createAgent({
  name: 'podcast-agent',
  description: 'Manages podcast creation state and provides agent-native features',
  initialState,
  
  // Tool functions the agent can call
  tools: {
    updateScript: {
      description: 'Updates podcast script in the editor',
      parameters: {
        content: { type: 'string', description: 'The script content to set' }
      }
    },
    
    setMode: {
      description: 'Switches between operational and podcast mode',
      parameters: {
        mode: { type: 'string', description: 'operational or podcast' }
      }
    },
    
    setProcessing: {
      description: 'Updates processing state for UI feedback',
      parameters: {
        isProcessing: { type: 'boolean', description: 'Whether agent is processing' }
      }
    }
  }
})

// Export types
export type { PodcastAgent } = typeof podcastAgent
