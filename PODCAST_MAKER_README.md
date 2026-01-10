# Podcast Maker - AI-Powered Podcast Creation Suite

## Overview

This is an AI-powered podcast creation tool designed to help users craft engaging, educational podcast content through iterative collaboration with AI. The application features a professional IDE-like interface with three panels for chatbot collaboration, script editing, and audio management.

## Architecture Decisions

### 1. Framework Selection: Custom React + Monaco (Theia Alternative)

**Decision**: Instead of using Eclipse Theia IDE, I chose a custom React-based architecture with Next.js 15, shadcn/ui components, and react-resizable-panels.

**Reasoning**:
- **Theia AI** is excellent but better suited for full IDE development with extensive tooling
- **Our use case** is a focused podcast creation tool, not a general-purpose code editor
- **Custom React approach** offers:
  - Faster development time using existing components
  - Full control over UX/UI customization for podcast-specific features
  - Easier integration with z-ai-web-dev-sdk for AI features
  - Better performance for our specific use case (three-panel layout, audio playback)

**Future Enhancement Path**: If the tool evolves into a full IDE with code editing, we could migrate to Theia platform since it supports VS Code extensions and has built-in AI orchestration.

### 2. UI Architecture: Three-Panel IDE Layout

**Panel 1 - Left (25%)**: AI Assistant Chatbot
- Collaborative script refinement through conversation
- Voice input via STT (Speech-to-Text)
- Context-aware responses with selected text
- Multi-turn conversation history

**Panel 2 - Center (50%)**: Script Editor
- Markdown-based script editor
- Text selection for contextual AI feedback
- Real-time editing with collaborative AI suggestions
- Support for tone directions: [enthusiastic tone], [laughing], etc.

**Panel 3 - Right (25%)**: Audio Controls
- Segment-by-segment audio generation
- Voice selection and configuration
- Playback controls with highlighting
- Export options (MP3/WAV/PCM)

### 3. Technology Stack

**Frontend**:
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components (New York style)
- Lucide React icons
- react-resizable-panels for split layout
- Framer Motion for animations
- Sonner for toast notifications

**Backend**:
- Next.js API Routes
- z-ai-web-dev-sdk for AI capabilities
- File system for audio storage

**AI Skills Used**:
- **LLM Skill**: Chat completions for script collaboration
- **TTS Skill**: Text-to-speech for audio generation
- **ASR Skill**: Speech-to-text for voice input

## Features Implemented

### ✅ Core Features (Phase 1)

1. **AI Chatbot Assistant** (`/api/chat`)
   - Multi-turn conversation management
   - Context-aware responses (selected text, script state)
   - Specialized system prompt for podcast script writing
   - Supports presenter directions, tone guidance, and style suggestions

2. **Markdown Script Editor**
   - Three-column IDE layout with resizable panels
   - Text selection for contextual AI feedback
   - Collaborative editing with AI assistance
   - Support for markdown formatting and tone directions

3. **Audio Generation & Management** (`/api/tts`)
   - Segment-based audio generation
   - Multiple voice options (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo)
   - Adjustable speed (0.5x - 2.0x) and volume (0.1x - 10.0x)
   - Support for WAV, MP3, and PCM formats
   - Individual segment regeneration (save tokens)

4. **Voice Input** (`/api/asr`)
   - Browser-based recording with MediaRecorder API
   - Real-time transcription using ASR skill
   - Selected text context integration
   - Edit before sending to AI

5. **File & URL Input**
   - Multi-file upload support
   - URL-based content analysis
   - Simulated AI content processing
   - Project context management

### 🚧 Planned Features (Phase 2+)

6. **Audio Playback with Word-by-Word Highlighting**
   - Real-time audio playback
   - Text synchronization with spoken words
   - Click-to-play from any segment
   - Progress tracking

7. **Documentation/Code Auditing**
   - Automatic code analysis
   - Generate podcast series outlines
   - Identify key themes and narratives
   - Suggest episode structures

8. **Premium TTS Integration**
   - ElevenLabs API support
   - Replicate audio models
   - Voice cloning capabilities
   - 15-second preview generation
   - Production-quality audio

9. **Local TTS Support**
   - Ollama-based TTS integration
   - Quick/free local audio generation
   - Offline capability
   - Multiple local voice models

10. **Standalone Executable Version**
    - Mini-service architecture
    - Browser-based IDE on localhost
    - Folder scanning for content
    - Config wizard for setup
    - Separate API keys and instructions config

## API Endpoints

### POST `/api/chat`
Handles AI-powered chat completions for script collaboration.

**Request**:
```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "selectedText": "Optional selected text for context",
  "context": {
    "scriptLength": 1000,
    "segmentsCount": 5
  }
}
```

**Response**:
```json
{
  "success": true,
  "response": "AI-generated response...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/tts`
Generates audio from text using TTS capability.

**Request**:
```json
{
  "text": "Text to convert to speech (max 1024 chars)",
  "voice": "tongtong",
  "speed": 1.0,
  "volume": 1.0,
  "format": "wav"
}
```

**Response**:
```json
{
  "success": true,
  "audioUrl": "/audio/podcast_12345.wav",
  "filename": "podcast_12345.wav",
  "size": 24568,
  "format": "wav",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/asr`
Transcribes audio to text using ASR capability.

**Request**: `FormData` with audio file

**Response**:
```json
{
  "success": true,
  "transcription": "Transcribed text...",
  "wordCount": 42,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage

### Getting Started

1. **Open the Application**: Navigate to the homepage
2. **Upload Content**:
   - Click "Upload Files" to add documents, code, or other materials
   - Click "Add URL" to analyze web content
3. **Collaborate with AI**:
   - Use the left panel chatbot to discuss your podcast vision
   - Select text in the editor and give specific feedback
   - Use voice input by clicking the microphone button
4. **Refine Script**:
   - Edit in the center markdown editor
   - Work with AI on tone, pacing, examples, and analogies
   - Add presenter directions like [enthusiastic], [thoughtful pause]
5. **Generate Audio**:
   - Use the right panel to generate audio for each segment
   - Configure voices, speed, and volume
   - Play back and iterate on specific lines
6. **Export**:
   - Export in MP3, WAV, or PCM format
   - Choose quality settings
   - Export script and project files

### Script Format Guidelines

Use markdown with presenter indicators and tone directions:

```markdown
# Episode 1: Introduction

**Presenter 1** [enthusiastic tone]:
Welcome to today's episode where we explore [TOPIC]!

**Presenter 2** [thoughtful tone]:
That's right. In this series, we'll dive deep into...

**Presenter 1** [casual, laughing]:
You know what I love about this? It's that...
```

### Voice Input

1. Click the microphone button in the chat input area
2. Speak your message
3. Click again to stop recording
4. Review and edit the transcribed text
5. Click Send to process with AI

### Selected Text Context

When working on specific sections:
1. Highlight/select text in the script editor
2. Type or speak your feedback in the chat
3. The AI will understand you're referring to that specific text
4. Get contextual suggestions without repeating the selection

## Configuration

### API Keys

The application uses `z-ai-web-dev-sdk` which handles API configuration. No additional setup required for the basic features.

### Voice Options

Available voices:
- **tongtong** (Default) - Natural, clear voice
- **chuichui** - Soft, warm voice
- **xiaochen** - Energetic voice
- **jam** - Friendly, casual voice
- **kazi** - Professional voice
- **douji** - Calm voice
- **luodo** - Expressive voice

## Architecture for Standalone Version

### Mini-Service Structure

For the standalone executable version:

```
/podcast-maker/
  ├── package.json
  ├── index.ts (main entry point)
  ├── public/
  │   └── audio/ (generated audio files)
  ├── src/
  │   ├── api/
  │   │   ├── chat.ts
  │   │   ├── tts.ts
  │   │   └── asr.ts
  │   └── client/ (frontend assets)
  ├── config/
  │   ├── api-keys.json (separate, not chat-editable)
  │   └── instructions.json (chat-editable)
  └── bun run dev
```

### Features for Standalone

1. **Folder Scanning**: Auto-detect and analyze project files
2. **Config Wizard**: First-run setup for API keys and preferences
3. **Local Web Server**: Runs on localhost with browser-based IDE
4. **Dual Config System**:
   - `api-keys.json`: Secure API key storage
   - `instructions.json`: Editable by chatbot for prompt refinement

### Setup Instructions

1. Extract the podcast-maker folder into your project directory
2. Run `bun install` to install dependencies
3. Run `bun run dev` to start the local server
4. Open browser to `http://localhost:3000`
5. Follow the config wizard for first-time setup

## Development

### Running the Development Server

```bash
bun run dev
```

The dev server runs on port 3000 and includes hot reload.

### Building for Production

```bash
bun run build
```

### Linting

```bash
bun run lint
```

## Future Enhancements

### Phase 2: Advanced Features
- Real-time audio playback with word highlighting
- Web scraping integration (Firecrawl, Crawl4AI)
- Documentation/code auto-auditing
- Premium TTS API integration (ElevenLabs, Replicate)
- Local TTS via Ollama models

### Phase 3: Professional Features
- Voice cloning capabilities
- Multi-presenter audio mixing
- Background music and sound effects
- Episode scheduling and series management
- Analytics and listener feedback

### Phase 4: Enterprise Features
- Multi-user collaboration
- Cloud storage and sync
- Version control for scripts
- Team workspace management
- API for third-party integrations

## Troubleshooting

### Audio Not Playing
- Check browser audio permissions
- Verify audio file exists in `/public/audio/`
- Check browser console for errors

### Voice Input Not Working
- Ensure microphone permissions are granted
- Check browser compatibility (requires MediaRecorder API)
- Verify audio recording format support

### AI Responses Not Generating
- Check `z-ai-web-dev-sdk` configuration
- Verify network connectivity
- Check browser console for error details
- Review API rate limits

## Contributing

This tool is designed to be extensible. Key areas for contribution:

1. **Additional TTS Voices**: Add more voice options to the system
2. **New Audio Formats**: Support additional output formats
3. **Web Scraping**: Add integrations for content sources
4. **MCP Integration**: Add Model Context Protocol servers for extended capabilities

## License

Built with z-ai-web-dev-sdk and follows the project's licensing terms.

---

**Built with**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
**AI Integration**: z-ai-web-dev-sdk (LLM, TTS, ASR)
**Status**: Phase 1 complete - Core features implemented
