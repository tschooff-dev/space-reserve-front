import Anthropic from '@anthropic-ai/sdk'
import {NextRequest} from 'next/server'

const systemPrompts: Record<string, string> = {
  concierge: `You are an expert luxury hotel concierge at Space Reserve, a premium hotel amenity reservation platform. Be elegant, warm, and knowledgeable about hospitality. Help guests discover and book amenities like spa treatments, pool access, fitness centers, and dining. Keep responses concise but refined. If asked about a specific hotel page, use that context to personalize your response.`,
  minimal: `You are a helpful assistant for Space Reserve hotel amenity reservations. Answer questions accurately and concisely.`,
  detailed: `You are a comprehensive hotel assistant for Space Reserve, a luxury amenity reservation platform. Provide rich, detailed information about amenities, booking processes, hotel features, and personalized recommendations. Help guests make the most of their stay with thorough, thoughtful answers.`,
}

type ModelConfig = {
  provider: string
  model: string
}

export async function POST(req: NextRequest) {
  const {messages, modelConfig, promptVariant, pageContext} = await req.json() as {
    messages: Array<{role: 'user' | 'assistant'; content: string}>
    modelConfig?: ModelConfig
    promptVariant?: string
    pageContext?: string
  }

  const model = modelConfig?.model ?? 'claude-haiku-4-5-20251001'
  const systemPromptKey = promptVariant ?? 'concierge'
  const basePrompt = systemPrompts[systemPromptKey] ?? systemPrompts.concierge
  const systemPrompt = pageContext ? `${basePrompt}\n\nCurrent page context: ${pageContext}` : basePrompt

  const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY})

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
  })
}
