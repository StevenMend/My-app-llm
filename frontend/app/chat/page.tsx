"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatContainer from "./components/ChatContainer"
import useChatLogic from "./components/useChatLogic"
import MessageList from "./components/MessageList"
import MessageInput from "./components/MessageInput"
import ResponseControls from "./components/ResponseControls"

export default function ChatPage() {
  const chat = useChatLogic()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
    }
  }, [])

  return (
    <ChatContainer
      sidebarVisible={chat.sidebarVisible}
      toggleSidebar={chat.toggleSidebar}
      sessions={chat.sessions}
      setSessions={chat.setSessions}
      currentSession={chat.currentSession}
      onSessionSelect={chat.loadSession}
      onNewSession={chat.createNewSession}
      currentSessionName={chat.currentSession.name}
      isGenerating={chat.isGenerating}
    >
      <MessageList
        messages={chat.messages}
        messagesEndRef={chat.messagesEndRef}
      />

      <ResponseControls
        isGenerating={chat.isGenerating}
        messages={chat.messages}
        stopGeneration={chat.stopGeneration}
        regenerateResponse={chat.regenerateResponse}
      />

      <MessageInput
        input={chat.input}
        setInput={chat.setInput}
        handleSendMessage={chat.handleSendMessage}
        handleFileUpload={chat.handleFileUpload}
        handleFileChange={chat.handleFileChange}
        fileInputRef={chat.fileInputRef}
        isGenerating={chat.isGenerating}
        isProcessingFiles={chat.isProcessingFiles}
        files={chat.files}
        removeFile={chat.removeFile}
      />
    </ChatContainer>
  )
}