import React from 'react'

interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Loading({ text = 'Loading...', size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 min-h-[200px] py-8 ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      <p className="font-foundation-sans text-gray-600 text-lg">{text}</p>
    </div>
  )
}

export function LoadingOverlay({ text = 'Loading...', size = 'md' }: LoadingProps) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <Loading text={text} size={size} />
    </div>
  )
}

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`loading-dots ${className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`}></div>
}

export function LoadingCompact({ text = 'Loading...', size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      <p className="font-foundation-sans text-gray-600">{text}</p>
    </div>
  )
}
