'use client'
import { useState } from 'react'
import type { ChatMessage } from '@/types'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  return { messages, setMessages, input, setInput, isTyping, setIsTyping }
}
