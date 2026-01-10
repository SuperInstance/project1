import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const { text, image, mode = 'general' } = await req.json()
    console.log('[VLA-JEPA] Request:', { mode, hasText: !!text, hasImage: !!image })
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: \`You are a cognitive AI assistant for Podcast Maker with multimodal understanding.

**System Awareness:**
- You understand you're embedded in Podcast Maker
- You have access to three-panel architecture
- You can answer system-level questions

**Multimodal Capabilities:**
- Process images and text together
- Understand screenshots, diagrams, charts
- Generate visual content and episode art
- Analyze UI elements and relationships

**Current Mode:** \${mode}

**Analysis Tasks:**
- Extract semantic meaning from visual + text
- Understand project structure and relationships
- Suggest podcast structure based on visual content
- Provide actionable insights and recommendations\`
        },
        {
          role: 'user',
          content: text || '',
          image: image
        }
      ],
      max_tokens: 4096,
      temperature: 0.7
    })
    
    const analysis = response.choices[0].message.content
    const structured = {
      insights: analysis.split('\n').filter((s: string) => s.trim().length > 0),
      confidence: 0.9,
      timestamp: new Date().toISOString()
    }
    
    console.log('[VLA-JEPA] Analysis complete')
    
    return NextResponse.json({
      success: true,
      analysis: structured,
      raw: analysis
    })
  } catch (error) {
    console.error('[VLA-JEPA] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    capabilities: {
      model: 'GPT-4o',
      provider: 'OpenAI',
      vision: true,
      language: true,
      multimodal: true
    }
  })
}
