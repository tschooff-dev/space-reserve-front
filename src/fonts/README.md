# Brand Fonts

This directory should contain the following font files:

## Aileron Font Family

- `Aileron-Light.woff2` - Aileron Light (300 weight)
- `Aileron-Regular.woff2` - Aileron Regular (400 weight)

## Foundation Sans Font Family

- `FoundationSans-Regular.woff2` - Foundation Sans Regular (400 weight)

## Font Sources

These fonts should be obtained from the brand guidelines or font licensing service. The fonts are configured in `src/app/layout.tsx` and will fallback to system fonts if not found.

## Fallback Fonts

- Aileron → Inter → system-ui → sans-serif
- Foundation Sans → Inter → system-ui → sans-serif
