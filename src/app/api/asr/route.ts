import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Cache for ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAIInstance() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Convert file to buffer then base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Audio = buffer.toString('base64')

    const zai = await getZAIInstance()

    // Transcribe audio using ASR
    const response = await zai.audio.asr.create({
      file_base64: base64Audio
    })

    const transcription = response.text

    if (!transcription || transcription.trim().length === 0) {
      throw new Error('Empty transcription result')
    }

    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      wordCount: transcription.split(/\s+/).length,
      duration: 0, // Would need audio processing to calculate
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ASR API Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
        success: false
      },
      { status: 500 }
    )
  }
}
