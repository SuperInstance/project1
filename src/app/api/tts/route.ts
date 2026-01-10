import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Cache for ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAIInstance() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// Ensure audio output directory exists
const AUDIO_DIR = join(process.cwd(), 'public', 'audio')

async function ensureAudioDir() {
  if (!existsSync(AUDIO_DIR)) {
    await mkdir(AUDIO_DIR, { recursive: true })
  }
}

// Split text into chunks if it exceeds 1024 characters
function splitTextIntoChunks(text: string, maxLength = 1000): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  let currentChunk = ''
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence
    } else {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim())

  return chunks
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0, volume = 1.0, format = 'wav' } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Validate parameters
    if (text.length > 1024) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 1024 characters. Please split into smaller chunks.' },
        { status: 400 }
      )
    }

    if (speed < 0.5 || speed > 2.0) {
      return NextResponse.json(
        { error: 'Speed must be between 0.5 and 2.0' },
        { status: 400 }
      )
    }

    if (volume <= 0 || volume > 10) {
      return NextResponse.json(
        { error: 'Volume must be greater than 0 and up to 10' },
        { status: 400 }
      )
    }

    const validFormats = ['wav', 'mp3', 'pcm']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    const zai = await getZAIInstance()
    await ensureAudioDir()

    // Generate audio using TTS
    const response = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice,
      speed: speed,
      volume: volume,
      response_format: format as 'wav' | 'mp3' | 'pcm',
      stream: false
    })

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer))

    // Generate unique filename
    const filename = `podcast_${Date.now()}_${Math.random().toString(36).substring(7)}.${format}`
    const filePath = join(AUDIO_DIR, filename)

    // Save audio file
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      audioUrl: `/audio/${filename}`,
      filename: filename,
      size: buffer.length,
      duration: 0, // Would need audio processing to calculate
      format: format,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('TTS API Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate audio',
        success: false
      },
      { status: 500 }
    )
  }
}
