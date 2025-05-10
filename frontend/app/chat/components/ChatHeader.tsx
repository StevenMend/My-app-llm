"use client"

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
  isGenerating,
}: ChatHeaderProps) {
  return (
    <div
      className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white pt-[17.8px] pb-[15px]"
      style={{ borderBottomWidth: "0.1px" }}
    >
      <div className="flex items-center justify-between w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* left */}
        <div className="flex items-center gap-4 text-lg font-medium text-gray-800">
          <Button
            className="-ml-2"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {/* Avatar eliminado */}
            {/* <div className={`avatar-energy ${isGenerating ? "animate-pulse-energy" : ""}`} /> */}
            <h1 className="text-lg font-semibold tracking-wide text-neutral-900">
              IA Reader
            </h1>
          </div>
        </div>

        {/* right */}
        <div className="flex-shrink-0">
          <Button variant="outline" size="sm" onClick={createNewSession}>
            <Plus className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}