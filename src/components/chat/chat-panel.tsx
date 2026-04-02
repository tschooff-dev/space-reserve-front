'use client'

import {useEffect, useRef, useState} from 'react'
import {ChatMessage} from './chat-message'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ChatPanelProps = {
  onClose: () => void
  userKey: string | undefined
  showSuggestedQuestions: boolean
  pageContext: string
}

const SUGGESTED_QUESTIONS = [
  'What amenities are available?',
  'How do I make a reservation?',
  'Can I cancel a booking?',
]

export function ChatPanel({onClose, userKey, showSuggestedQuestions, pageContext}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const params = userKey ? `?userKey=${userKey}` : ''
    fetch(`/api/chat/greeting${params}`)
      .then(r => r.json())
      .then(({greeting}) => {
        if (greeting) setMessages([{role: 'assistant', content: greeting}])
      })
      .catch(() => {})
  }, [userKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = {role: 'user', content: text.trim()}
    // Exclude the greeting (first assistant message) from API history — it's display only
    const history = messages.length === 1 && messages[0].role === 'assistant' ? [] : messages
    const updatedMessages = [...history, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    const assistantMessage: Message = {role: 'assistant', content: ''}
    setMessages([...updatedMessages, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: updatedMessages,
          userKey,
          pageContext,
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      while (true) {
        const {done, value} = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + chunk,
          }
          return next
        })
      }
    } catch {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = {
          role: 'assistant',
          content: 'I apologize, something went wrong. Please try again.',
        }
        return next
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col bg-white border border-black/10 shadow-2xl" style={{width: 360, height: 520}}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-black text-white shrink-0">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase font-header font-light">Space Reserve</p>
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/50 mt-0.5">Concierge</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors text-lg leading-none"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#fafafa]">
        {messages.length === 1 && showSuggestedQuestions && (
          <div className="space-y-2 mt-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="w-full text-left text-[11px] px-4 py-3 bg-white border border-black/10 text-black/70 hover:border-black/30 hover:text-black transition-colors tracking-wide"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => msg.content ? (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ) : null)}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/10 px-4 py-3">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-black/30 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <span className="w-1 h-1 bg-black/30 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <span className="w-1 h-1 bg-black/30 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex border-t border-black/10 bg-white">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={isStreaming}
          className="flex-1 px-4 py-3.5 text-xs bg-transparent outline-none placeholder:text-black/30 tracking-wide"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          className="px-4 text-xs tracking-[0.2em] text-black/40 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase"
        >
          Send
        </button>
      </div>
    </div>
  )
}
