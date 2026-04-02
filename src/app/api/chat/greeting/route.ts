import {NextRequest} from 'next/server'
import {getAiClient} from '@/lib/launchdarkly-server'

const FALLBACK_GREETING = 'Welcome to Space Reserve. I\'m your personal concierge — I can help you explore amenities, check availability, and make reservations. How can I assist you today?'

const FALLBACK_CONFIG = {
  model: {name: 'claude-haiku-4-5-20251001'},
  messages: [{role: 'system' as const, content: ''}],
}

export async function GET(req: NextRequest) {
  const userKey = req.nextUrl.searchParams.get('userKey') ?? 'anonymous'

  const ldContext = {
    kind: 'user' as const,
    key: userKey,
    anonymous: userKey === 'anonymous',
  }

  try {
    const aiClient = await getAiClient()
    const aiConfig = await aiClient.completionConfig('space-reserve-concierge', ldContext, FALLBACK_CONFIG)

    // Find the first assistant message in the config — this is the greeting set in LD
    const greeting = (aiConfig.messages ?? []).find((m: {role: string}) => m.role === 'assistant')

    return Response.json({
      greeting: (greeting as {role: string; content: string} | undefined)?.content ?? FALLBACK_GREETING,
    })
  } catch {
    return Response.json({greeting: FALLBACK_GREETING})
  }
}
