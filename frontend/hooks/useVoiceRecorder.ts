import { useState, useRef } from "react"

export function useVoiceRecorder(
  setInput: (value: string) => void,
  setIsTranscribing: (value: boolean) => void
) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    console.log(" startRecording")
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorderRef.current.onstop = async () => {
      console.log("stopRecording")
      const blob = new Blob(audioChunks.current, { type: "audio/webm" })
      console.log(" audioBlob created:", blob)
      audioChunks.current = []

      try {
        setIsTranscribing(true)

        const formData = new FormData()
        formData.append("file", blob, "recording.webm")

        console.log(" Sending to /transcribe...")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
          method: "POST",
          body: formData,
        })

        console.log("Response status:", response.status)

        const data = await response.json()
        console.log(" Whisper response:", data)

        if (data.text) {
          setInput(data.text)
          console.log(" setInput:", data.text)
        } else {
          console.log(" No transcribed text in response")
        }
      } catch (err) {
        console.error(" Error transcribing audio:", err)
      } finally {
        setIsTranscribing(false)
      }
    }

    mediaRecorderRef.current.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.stop()
    }
    setIsRecording(false)
  
    if (recorder?.stream) {
      recorder.stream.getTracks().forEach((track) => {
        track.stop()
      })
      console.log("Microphone stream stopped.")
    }
  }
  

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}
