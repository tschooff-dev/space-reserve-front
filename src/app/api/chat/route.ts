import Anthropic from '@anthropic-ai/sdk'
import {NextRequest} from 'next/server'
import {TOOL_DEFINITIONS, executeToolCall} from './tools'
import {getAiClient} from '@/lib/launchdarkly-server'

const FALLBACK_CONFIG = {
  model: {name: 'claude-haiku-4-5-20251001'},
  messages: [
    {
      role: 'system' as const,
      content:
        'You are an expert luxury hotel concierge at Space Reserve. Be elegant, warm, and knowledgeable. Help guests discover and book amenities. Use tools to check real-time availability when asked.',
    },
  ],
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
  const {messages, userKey, pageContext} = (await req.json()) as {
    messages: Anthropic.MessageParam[]
    userKey?: string
    pageContext?: string
  }

  const ldContext = {
    kind: 'user' as const,
    key: userKey ?? 'anonymous',
    anonymous: !userKey,
  }

  // Get model + system prompt from LD AI Config
  let aiConfig
  try {
    const aiClient = await getAiClient()
    aiConfig = await aiClient.completionConfig('space-reserve-concierge', ldContext, FALLBACK_CONFIG)
  } catch {
    aiConfig = {...FALLBACK_CONFIG, tracker: undefined, enabled: true}
  }

  const model = aiConfig.model?.name ?? FALLBACK_CONFIG.model.name

  // If the config is disabled in LD, fall back to the default
  const configMessages = (aiConfig.enabled === false ? FALLBACK_CONFIG.messages : aiConfig.messages) ?? FALLBACK_CONFIG.messages

  // Extract system messages from LD config and append page context
  const systemMessages = configMessages
    .filter((m: {role: string}) => m.role === 'system')
    .map((m: {role: string; content: string}) => m.content)
    .join('\n')

  const today = new Date().toISOString().split('T')[0]
  const dayOfWeek = new Date().toLocaleDateString('en-US', {weekday: 'long'})

  const systemPrompt = [
    systemMessages,
    `Today is ${dayOfWeek}, ${today}. Always resolve relative dates like "this Saturday" or "tomorrow" yourself using this date — never ask the guest to provide a date in any specific format.`,
    pageContext ? `Current page context: ${pageContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

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

      // Track token usage back to LD
      aiConfig.tracker?.trackTokens({
        total: response.usage.input_tokens + response.usage.output_tokens,
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      })
      aiConfig.tracker?.trackSuccess()

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
