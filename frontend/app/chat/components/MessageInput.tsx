
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, Mic, FileText, X } from "lucide-react"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"

interface MessageInputProps {
  input: string
  setInput: (value: string) => void
  handleSendMessage: () => Promise<void> 
  handleFileUpload: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  isGenerating: boolean
  isProcessingFiles: boolean
  files: File[]
  removeFile: (index: number) => void
}

export default function MessageInput({
  input,
  setInput,
  handleSendMessage,
  handleFileUpload,
  handleFileChange,
  fileInputRef,
  isGenerating,
  isProcessingFiles,
  files,
  removeFile,
}: MessageInputProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSending, setIsSending] = useState(false) 

  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useVoiceRecorder(setInput, setIsTranscribing)

  const handleSend = async () => {
    if (isGenerating || isProcessingFiles || isSending) return
    setIsSending(true)
    try {
      await handleSendMessage()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="px-6 md:px-12 lg:px-16 xl:px-20 py-4">
      {/* Show selected files */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 items-center">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 text-sm px-3 py-1 rounded-md shadow-sm"
            >
              <FileText className="w-4 h-4 mr-1 text-gray-600" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <X
                className="ml-2 h-4 w-4 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => removeFile(index)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2"
          onClick={handleFileUpload}
          disabled={isGenerating || isProcessingFiles || isSending}
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isGenerating || isProcessingFiles || isSending}
        />

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isProcessingFiles ? "Processing files..." : "Ask me anything about your documents"
          }
          className="pl-12 pr-12 py-8 rounded-full border border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black focus-visible:ring-black"
          disabled={isGenerating || isProcessingFiles || isSending}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              await handleSend()
            }
          }}
        />

        {/* state indiacated*/}
        {isRecording && (
          <span className="absolute right-14 h-3 w-3 rounded-full bg-red-600 animate-ping"></span>
        )}

        {isTranscribing && !isRecording && (
          <div className="absolute right-14 flex items-center gap-2 text-xs text-blue-600">
            <div className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
          </div>
        )}

        {/* Botón Send o Mic */}
        {input.trim() || files.length > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2"
            onClick={handleSend}
            disabled={isGenerating || isProcessingFiles || isSending}
          >
            <Send className="h-5 w-5 text-gray-500" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2"
            onClick={() => {
              isRecording ? stopRecording() : startRecording()
            }}
            disabled={isGenerating || isProcessingFiles || isSending}
          >
            <Mic
              className={`h-5 w-5 text-gray-500 ${
                isGenerating ? "opacity-50" : "hover:text-blue-600"
              }`}
            />
          </Button>
        )}
      </div>
    </div>
  )
}