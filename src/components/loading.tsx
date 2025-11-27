import React from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block rounded-full border-2 border-black/20 border-t-black animate-spin ${sizeClasses[size]} ${className}`.trim()}
    />
  )
}

export function LoadingOverlay({size = 'md', className = '', label}: LoadingSpinnerProps) {
  return (
    <div
      className={`fixed inset-0 bg-white/90 flex items-center justify-center z-50 ${className}`.trim()}
    >
      <LoadingSpinner size={size} label={label} />
    </div>
  )
}
