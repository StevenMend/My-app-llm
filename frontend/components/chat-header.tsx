"use client"

import { useEffect, useState } from "react"
import { Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  toggleSidebar: () => void
  createNewSession: () => void
  currentSessionName: string
  isGenerating: boolean
}

export default function ChatHeader({
  toggleSidebar,
  createNewSession,
  currentSessionName,
  isGenerating
}: ChatHeaderProps) {
  const [flash, setFlash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setFlash(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`border-b py-4 w-full transition-colors duration-500 ${
        flash ? "bg-green-200" : "bg-white"
      }`}
    >
      <div className="w-full flex flex-wrap items-center justify-between px-4 md:px-6 gap-2 sm:gap-4">
        {/* LEFT: Menu + Name */}
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-medium text-sm sm:text-base truncate">{currentSessionName}</h1>
        </div>

        {/* RIGHT: New Chat Button */}
        <div className="shrink-0">
          <Button variant="outline" size="sm" onClick={createNewSession}>
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">...</span>
          </Button>
        </div>
      </div>
    </div>
  )
}