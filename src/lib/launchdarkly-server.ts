import {init} from '@launchdarkly/node-server-sdk'
import {initAi} from '@launchdarkly/server-sdk-ai'

// Hardcoded default for evaluator convenience — LD_SDK_KEY still overrides when set.
const sdkKey = process.env.LD_SDK_KEY ?? 'sdk-4bfaec98-d77f-4009-a7ae-ad806171f612'

let aiClientPromise: ReturnType<typeof initAi> | null = null

export async function getAiClient() {
  if (!aiClientPromise) {
    const ldClient = init(sdkKey)
    await ldClient.waitForInitialization({timeout: 10})
    aiClientPromise = initAi(ldClient)
  }
  return aiClientPromise
}
