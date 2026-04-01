import Anthropic from '@anthropic-ai/sdk'
import {NextRequest} from 'next/server'
import {TOOL_DEFINITIONS, executeToolCall} from './tools'

const systemPrompts: Record<string, string> = {
  concierge: `You are an expert luxury hotel concierge at Space Reserve, a premium hotel amenity reservation platform. Be elegant, warm, and knowledgeable about hospitality. Help guests discover and book amenities like spa treatments, pool access, fitness centers, and dining. Keep responses concise but refined.

When guests ask about availability, always use the check_availability tool to fetch live data — never guess. If you need to know what amenities a hotel offers first, use get_hotel_amenities. When you have the hotel slug from page context, use it directly.`,

  minimal: `You are a helpful assistant for Space Reserve hotel amenity reservations. Answer questions accurately and concisely. Use tools to check real-time availability when asked.`,

  detailed: `You are a comprehensive hotel assistant for Space Reserve, a luxury amenity reservation platform. Provide rich, detailed information about amenities, booking processes, hotel features, and personalized recommendations. Always use the check_availability tool for live availability data — never estimate. Use get_hotel_amenities to learn what a hotel offers before making recommendations.`,
}

type ModelConfig = {
  provider: string
  model: string
}

function textResponse(text: string) {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text))
        controller.close()
      },
    }),
    {headers: {'Content-Type': 'text/plain; charset=utf-8'}},
  )
}

export async function POST(req: NextRequest) {
  const {messages, modelConfig, promptVariant, pageContext} = (await req.json()) as {
    messages: Anthropic.MessageParam[]
    modelConfig?: ModelConfig
    promptVariant?: string
    pageContext?: string
  }

  const model = modelConfig?.model ?? 'claude-haiku-4-5-20251001'
  const systemPromptKey = promptVariant ?? 'concierge'
  const basePrompt = systemPrompts[systemPromptKey] ?? systemPrompts.concierge
  const systemPrompt = pageContext ? `${basePrompt}\n\nCurrent page context: ${pageContext}` : basePrompt

  const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY})
  const messagesForAPI: Anthropic.MessageParam[] = [...messages]

  // Agentic loop — execute tool calls until Claude gives a final text response
  for (let round = 0; round < 4; round++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesForAPI,
      tools: TOOL_DEFINITIONS,
    })

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text')
      const text = textBlock?.type === 'text' ? textBlock.text : ''
      return textResponse(text)
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block): Promise<Anthropic.ToolResultBlockParam> => {
          const result = await executeToolCall(block.name, block.input as Record<string, string>)
          return {
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          }
        }),
      )

      messagesForAPI.push({role: 'assistant', content: response.content})
      messagesForAPI.push({role: 'user', content: toolResults})
      continue
    }

    break
  }

  return textResponse("I'm sorry, I wasn't able to complete that request. Please try again.")
}
