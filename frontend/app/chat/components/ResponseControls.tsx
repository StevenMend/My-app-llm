"use client"

import { Button } from "@/components/ui/button"
import { StopCircle } from "lucide-react"
import type { Message } from "./useChatLogic"
import React from "react"

interface ResponseControlsProps {
  isGenerating: boolean
  messages: Message[]
  stopGeneration: () => void
  regenerateResponse: () => void
}

export default function ResponseControls({
  isGenerating,
  messages,
  stopGeneration,
  regenerateResponse
}: ResponseControlsProps) {
  const lastMessage = messages[messages.length - 1]

  if (isGenerating) {
    // return (
    //   <div className="px-6 py-2 flex justify-center">
    //     <Button variant="outline" size="sm" onClick={stopGeneration} className="flex items-center">
    //       <StopCircle className="h-4 w-4 mr-1 text-red-500" />
    //       Stop generating
    //     </Button>
    //   </div>
    // )
  }

  return null
}
