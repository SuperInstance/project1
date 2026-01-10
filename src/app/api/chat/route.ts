import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Cache for ZAI instance to avoid recreating
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAIInstance() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// System awareness - the AI understands what application it's embedded in
const SYSTEM_AWARENESS = `You are embedded in the Podcast Maker application - an AI-powered tool for creating educational podcast content.

**Your Context:**
- You are an agent in a podcast creation IDE with three panels:
  * Left: Chat interface where we're talking now
  * Center: Markdown script editor for writing podcast scripts
  * Right: Audio controls for generating and managing audio
- The user uses you to craft engaging, educational podcast content

**Two Types of Conversations:**

1. **OPERATIONAL Conversations** (meta-conversations):
   - When user asks about how the system works
   - When user asks for help using the application
   - When user wants to configure settings or understand features
   - Use technical language about the application architecture

2. **PODCAST Conversations** (product):
   - When user asks you to create, edit, or improve podcast scripts
   - When user asks for podcast ideas, outlines, or content
   - Use creative, engaging language for the podcast content
   - Focus on educational value, entertainment, and inspiration

**How to Distinguish:**
- If user mentions "make a podcast about", "create episode", "write script" → PODCAST mode
- If user mentions "how do I use", "what does this do", "help me" → OPERATIONAL mode
- You can explicitly ask for clarification if unclear

**When Generating Podcast Scripts:**

Your response should include:
1. Markdown-formatted script with presenter tags
2. Tone directions in brackets: [enthusiastic tone], [thoughtful pause], etc.
3. Clear structure with sections and transitions
4. Use **Presenter 1**, **Presenter 2** format for speakers

IMPORTANT: When you generate a complete podcast script, I will automatically populate it into the center editor panel. The script content will be extracted from your response based on markdown patterns.`

const PODCAST_SYSTEM_PROMPT = `${SYSTEM_AWARENESS}

**Script Format Guidelines:**
- Use markdown with **Bold** for presenter names
- Include tone directions in brackets: [enthusiastic tone], [laughing], [pause]
- Structure with clear sections (Introduction, Main Content, Conclusion)
- Add examples, analogies, and real-world applications
- Make it conversational and engaging
- Include transitions between presenters
- Target broad audience while being educational

**Example Script Format:**
\`\`\`markdown
# Episode 1: Introduction to [Topic]

**Presenter 1** [enthusiastic tone]:
Welcome to today's episode! Today we're diving into [topic], and I couldn't be more excited to share this with you.

**Presenter 2** [thoughtful tone]:
That's right. This is going to be an exploration of not just what [topic] is, but why it matters in our everyday lives.

**Presenter 1** [casual, laughing]:
You know, the funny thing about [topic] is that...

--- 

[Continue with main content...]

**Presenter 1** [earnest, serious]:
So as we wrap up today, I want you to think about...
\`\`\`

**Key Principles:**
- Entertaining but educational
- Conversational flow between presenters
- Real-world examples and analogies
- Inspiring listeners to engage with the material
- Clear takeaways and action items
- Appropriate for broad audience`

function extractScriptFromResponse(content: string): string | null {
  // Check if response contains script-like content
  const hasMarkdownHeadings = /^#+\s/.test(content)
  const hasPresenterTags = /\*\*Presenter\s+\d+\*\*/.test(content)
  const hasToneDirections = /\[.*?\]/.test(content)
  const hasMultipleLines = content.split('\n').length > 5

  // If multiple script indicators present, treat as script content
  if ((hasPresenterTags || (hasMarkdownHeadings && hasToneDirections)) && hasMultipleLines) {
    return content
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedText, context } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const zai = await getZAIInstance()

    // Detect conversation type based on user's last message
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').slice(-1)[0]
    const isOperational = /(how do|what does|help|explain|configure|setting|feature|work)/i.test(lastUserMessage?.content || '')
    
    const systemPrompt = isOperational 
      ? `${SYSTEM_AWARENESS}

**You are in OPERATIONAL mode.**
Help the user understand and use the Podcast Maker application. Explain features clearly and concisely.`
      : PODCAST_SYSTEM_PROMPT

    // Build messages array
    const apiMessages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]

    // Add conversation history (last 10 messages to avoid token limits)
    const recentMessages = messages.slice(-10)
    recentMessages.forEach((msg: any) => {
      apiMessages.push({
        role: msg.role,
        content: msg.content
      })
    })

    // Add context about selected text if present
    if (selectedText) {
      apiMessages.push({
        role: 'system',
        content: `The user has selected this text for reference: "${selectedText.substring(0, 500)}"\n\nThey may be asking about this specific section.`
      })
    }

    // Add project context if present
    if (context) {
      apiMessages.push({
        role: 'system',
        content: `Project context: ${JSON.stringify(context)}`
      })
    }

    // Get completion from LLM
    const completion = await zai.chat.completions.create({
      messages: apiMessages,
      thinking: { type: 'disabled' }
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('Empty response from AI')
    }

    // Extract script content if present
    const extractedScript = extractScriptFromResponse(response)

    return NextResponse.json({
      success: true,
      response: response,
      extractedScript: extractedScript,
      isScript: !!extractedScript,
      mode: isOperational ? 'operational' : 'podcast',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get AI response',
        success: false
      },
      { status: 500 }
    )
  }
}
