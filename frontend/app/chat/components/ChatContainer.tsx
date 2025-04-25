
import ChatSidebar from "@/components/chat-sidebar"
import ChatHeader from "./ChatHeader"
import type { Session } from "./useChatLogic"
import React from "react"

interface ChatContainerProps {
  children: React.ReactNode
  sidebarVisible: boolean
  toggleSidebar: () => void
  sessions: Session[]
  setSessions: (sessions: Session[]) => void  
  currentSession: Session
  onSessionSelect: (id: string) => void
  onNewSession: () => void
  currentSessionName: string
  isGenerating: boolean
}


export default function ChatContainer({
  children,
  sidebarVisible,
  toggleSidebar,
  sessions,
  setSessions, 
  currentSession,
  onSessionSelect,
  onNewSession,
  currentSessionName,
  isGenerating

}: ChatContainerProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSessionSelect={onSessionSelect}
          onNewSession={onNewSession}
          sidebarVisible={sidebarVisible}
          setSessions={setSessions}
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Moveable container */}
      <div
        className={`relative z-10 flex flex-col h-full w-full transition-all duration-300 ease-in-out ${
          sidebarVisible ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <div
  className={`sticky top-0 z-40 border-b border-gray-200 bg-white transition-all duration-300 ease-in-out ${
    sidebarVisible ? "ml-1 md:ml-0" : "ml-0"
  }`}
>
  <ChatHeader
    toggleSidebar={toggleSidebar}
    createNewSession={onNewSession}
    currentSessionName={currentSessionName}
    isGenerating={isGenerating}
  />
</div>

        {/* Menssages */}
        <div className="flex-1 overflow-y-auto text-lg">
          <div className="w-full max-w-6xl mx-auto px-6 py-6">
            {Array.isArray(children) ? children.slice(0, -1) : children}
          </div>
        </div>

        {/* Input */}
        <div className="w-full bg-white pt-2">
          <div className="w-full max-w-4xl mx-auto px-6 py-4">
            {Array.isArray(children) ? children[children.length - 1] : null}
          </div>
        </div>
      </div>
    </div>
  )
}