'use client'

/**
 * FeaturedBanner — a promotional landing page component gated by the
 * 'hotels-featured-banner' LaunchDarkly feature flag.
 *
 * This component is part of the Part 2 demo: it is shown/hidden based on
 * individual targeting (specific user emails) and rule-based targeting
 * (e.g. all users whose email contains a certain domain).
 *
 * To recreate the flag in LaunchDarkly:
 *   Key:  hotels-featured-banner
 *   Type: Boolean
 *   Default variation: false (off)
 *   Enable "SDKs using Client-side ID" in the flag settings
 *
 * Targeting examples (set up in the LaunchDarkly dashboard):
 *   Individual → Add a specific user email to the "Target individuals" section
 *   Rule-based → Add a rule: "email contains @yourdomain.com" → serve true
 */
export default function FeaturedBanner() {
  return (
    <div className="w-full border-2 border-black bg-black text-white p-8 sm:p-12 mb-8 sm:mb-12">
      <p className="text-xs uppercase tracking-[0.5em] text-white/50 mb-4">New This Season</p>
      <h2 className="text-3xl sm:text-4xl font-aileron-light uppercase tracking-[0.4em] mb-4">
        Summer Collection
      </h2>
      <p className="text-sm font-aileron-regular text-white/70 max-w-lg leading-relaxed">
        Exclusive access to our most sought-after poolside experiences. Reserve your preferred time before availability closes.
      </p>
    </div>
  )
}
