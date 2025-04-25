
"use client"

import ChatMessage from "@/components/chat-message"
import type { Message } from "./useChatLogic"
import React from "react"

interface MessageListProps {
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  onRegenerate: () => void 
}

export default function MessageList({ messages, messagesEndRef, onRegenerate }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 xl:px-20 py-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRegenerate={onRegenerate} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}