'use client'

type ChatMessageProps = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({role, content}: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 text-xs leading-relaxed ${
          isUser
            ? 'bg-black text-white'
            : 'bg-white border border-black/10 text-black'
        }`}
      >
        {content}
      </div>
    </div>
  )
}
