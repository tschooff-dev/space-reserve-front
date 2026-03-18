import {NextRequest, NextResponse} from 'next/server'

/**
 * Remediation / "kill switch" endpoint.
 *
 * Call this (e.g. via curl) to force-disable a feature flag in LaunchDarkly
 * without redeploying. Keep it protected via LD_KILL_SWITCH_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.LD_KILL_SWITCH_SECRET
  const authHeader = request.headers.get('x-kill-switch-secret')

  if (!secret || !authHeader || authHeader !== secret) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const token = process.env.LD_API_TOKEN
  const projectKey = process.env.LD_PROJECT_KEY
  const environmentKey = process.env.LD_ENVIRONMENT_KEY

  // The demo flag used in the UI (`src/app/hotels/page.tsx`).
  // We support both plural/singular keys to match likely demo mistakes.
  const flagKeys = ['hotels-search-v2', 'hotel-search-v2']

  if (!token || !projectKey || !environmentKey) {
    return NextResponse.json(
      {
        error:
          'Missing LaunchDarkly configuration. Set LD_API_TOKEN, LD_PROJECT_KEY, LD_ENVIRONMENT_KEY.',
      },
      {status: 500}
    )
  }

  // LaunchDarkly uses JSON Patch to update a flag.
  // Docs: https://apidocs.launchdarkly.com/
  try {
    const results = await Promise.all(
      flagKeys.map(async (flagKey) => {
        const url = `https://app.launchdarkly.com/api/v2/flags/${encodeURIComponent(
          projectKey
        )}/${encodeURIComponent(flagKey)}`

        const patch = [
          {
            op: 'replace',
            path: `/environments/${environmentKey}/on`,
            value: false,
          },
        ]

        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patch),
          cache: 'no-store',
        })

        const text = await res.text().catch(() => '')
        return {
          flagKey,
          ok: res.ok,
          status: res.status,
          details: res.ok ? undefined : text,
        }
      })
    )

    return NextResponse.json({ok: true, results})
  } catch (error) {
    return NextResponse.json({error: 'Failed to call LaunchDarkly API', details: String(error)}, {status: 502})
  }
}

