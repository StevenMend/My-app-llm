
"use client"

import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { uploadPDFs, sendPromptStream, createNewChatSession } from "@/lib/api"

export interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isStreaming?: boolean
  references?: {
    text: string
    page: number
    source: string
  }[]
  attachments?: {
    name: string
    url: string
    type: string
  }[]
}

export interface Session {
  id: string
  name: string
  lastActive: Date
}

export default function useChatLogic() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session>({
    id: "new", name: "New Conversation", lastActive: new Date()
  })
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile || messages.length > 1) setSidebarVisible(false)
  }, [isMobile, messages.length])

  useEffect(() => {
    if (currentSession?.id && currentSession.id !== "new") {
      localStorage.setItem("last_session_id", currentSession.id)
    }
  }, [currentSession])

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("Error fetching sessions")

        const data = await res.json()
        const formatted = data.map((s: any) => ({
          id: s.session_id,
          name: s.name,
          lastActive: new Date(s.last_active),
        }))

        setSessions(formatted)

        const lastSessionId = localStorage.getItem("last_session_id")
        const existing = formatted.find(s => s.id === lastSessionId)

        if (existing) {
          console.log("Restoring previous session:", existing)
          setCurrentSession(existing)
        }
      } catch (err: any) {
        toast({
          title: "Failed to load sessions",
          description: err.message,
          variant: "destructive",
        })
      }
    }

    fetchSessions()
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (currentSession.id !== "new") {
      console.log("Auto-loadSession triggered for session:", currentSession.id)
      loadSession(currentSession.id)
    }
  }, [currentSession.id])

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible)

  const createNewSession = async (): Promise<Session | null> => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No token found")
      console.log("createNewSession was executed")

      const newSession = await createNewChatSession()

      const sessionObj: Session = {
        id: newSession.session_id,
        name: newSession.name,
        lastActive: new Date(newSession.last_active),
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Error validating session with backend")

      const allSessions = await res.json()
      const formatted = allSessions.map((s: any) => ({
        id: s.session_id,
        name: s.name,
        lastActive: new Date(s.last_active),
      }))

      const validated = formatted.find((s) => s.id === sessionObj.id)
      if (!validated) throw new Error("Session not found in backend")

      setSessions((prev) => [validated, ...prev])
      setCurrentSession(validated)

      return validated
    } catch (err: any) {
      toast({
        title: "Failed to create session",
        description: err.message,
        variant: "destructive",
      })
      return null
    }
  }

  const resetChatState = () => {
    setMessages([])
    setSessions([])
    setCurrentSession({ id: "new", name: "New Conversation", lastActive: new Date() })
    setFiles([])
    setInput("")
  }

  const handleFileUpload = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)
    const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
    const nonPdfFiles = newFiles.filter((file) => file.type !== "application/pdf")

    if (nonPdfFiles.length) {
      toast({
        title: "Only PDF files are supported",
        description: "Please upload PDF files only for analysis.",
        variant: "destructive",
      })
    }

    if (pdfFiles.length) {
      setFiles((prev) => [...prev, ...pdfFiles])
      toast({
        title: `${pdfFiles.length} PDF${pdfFiles.length > 1 ? "s" : ""} added`,
        description: "Your PDFs are ready to be analyzed.",
      })
    }

    if (e.target) e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSessionName = async (newName: string) => {
    if (!currentSession || currentSession.id === "new") return
  
    try {
      const token = localStorage.getItem("access_token")
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions/${currentSession.id}/name`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_name: newName }),
        }
      )
  
      
      const updatedSession = { ...currentSession, name: newName }
      setCurrentSession(updatedSession)
      setSessions(prev =>
        prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
      )
  
    } catch (err) {
      console.error("Error updating session name:", err)
    }
  }




  const handleSendMessage = async () => {
    if ((!input.trim() && files.length === 0) || isGenerating) return;
  
    
    if (currentSession.id === "new") {
      const newSession = await createNewSession();
      if (!newSession) return;
    }
  
    
    const userMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
      attachments: files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      })),
    };
  
    setMessages(prev => [...prev, userMessage]);
    setFiles([]);
    setInput("");
  
    
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: currentSession.id,
          sender: "user",
          content: input,
          attachments: userMessage.attachments,
        }),
      });
    } catch (err) {
      console.error("Error saving user message:", err);
    }
  
    
    try {
      if (files.length > 0) {
        if (!input.trim()) {
          await handleOnlyFileUpload();
          return;
        }
  
        setIsProcessingFiles(true);
        await uploadPDFs(files, currentSession.id);
        setIsProcessingFiles(false);
      }
  
      await processUserQuestion();
  
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessingFiles(false);
    }
  };
  
  const processUserQuestion = async () => {
    const aiMessageId = (Date.now() + 1).toString();
    let references: any[] = [];
  
    setMessages(prev => [...prev, {
      id: aiMessageId,
      content: "",
      sender: "ai",
      timestamp: new Date(),
      isStreaming: true
    }]);
    setIsGenerating(true);
  
    try {
      const reader = await sendPromptStream({ prompt: input, sessionId: currentSession.id });
      let responseText = "";
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim().startsWith("data:"));
  
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.replace("data: ", "").trim());
            if (parsed.answer) {
              responseText += parsed.answer;
              if (parsed.references) references = parsed.references;
              setMessages(prev => prev.map(m =>
                m.id === aiMessageId ? {
                  ...m,
                  content: responseText,
                  references: references
                } : m
              ));
            }
          } catch (err) {
            console.warn("Error parsing chunk:", err);
          }
        }
      }
  
      
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId ? {
          ...m,
          content: responseText.trim(),
          isStreaming: false,
          references
        } : m
      ));
  
      try {
        const token = localStorage.getItem("access_token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: currentSession.id,
            sender: "ai",
            content: responseText.trim(),
            references
          }),
        });
      } catch (err) {
        console.error("Error saving AI message:", err);
      }
  
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId ? {
          ...m,
          content: "[Error]",
          isStreaming: false
        } : m
      ));
    } finally {
      setIsGenerating(false);
    }
  };




  
  const stopGeneration = () => {
    setIsGenerating(false)
    toast({ title: "Generation stopped", description: "The response generation has been stopped." })
  }

  const regenerateResponse = () => {
    if (isGenerating) return
    const lastAiIndex = [...messages].reverse().findIndex((m) => m.sender === "ai")
    if (lastAiIndex === -1) return
    setMessages((prev) => prev.slice(0, -1))
    handleSendMessage()
  }

  const loadSession = async (id: string) => {
    console.log("loadSession executed with id:", id)

    const session = sessions.find((s) => s.id === id)
    if (!session) {
      console.warn("Session not found in status:", id)
      return
    }

    console.log("Session found:", session)

    try {
      const token = localStorage.getItem("access_token")
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Fetch done. Status:", res.status)

      if (!res.ok) throw new Error("Failed to load session messages")

      const data = await res.json()
      console.log("Raw messages received:", data)

      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: String(msg.id),
        content: msg.content,
        sender: msg.sender === "user" || msg.sender === "ai" ? msg.sender : "ai",
        timestamp: new Date(msg.timestamp),
        attachments: msg.attachments || [],
      }))

      console.log("Formatted messages:", formattedMessages)

      setMessages(formattedMessages)
      setCurrentSession({ ...session })

      if (isMobile) setSidebarVisible(false)
    } catch (err: any) {
      console.error("Error loading session:", err.message)
      toast({
        title: "Error loading session",
        description: err.message,
        variant: "destructive",
      })
    }
  }
  



  const handleOnlyFileUpload = async () => {
    if (files.length === 0 || isGenerating || isProcessingFiles) return;

    if (currentSession.id === "new") {
      console.log(" No session yet. Creating one before upload...");
      try {
        const newSession = await createNewChatSession();
        const sessionObj = {
          id: newSession.session_id,
          name: newSession.name,
          lastActive: new Date(newSession.last_active),
        };
        setCurrentSession(sessionObj);
        setSessions((prev) => [sessionObj, ...prev]);
        localStorage.setItem("last_session_id", sessionObj.id);
      } catch (err: any) {
        toast({ title: "Failed to create session", description: err.message, variant: "destructive" });
        return;
      }
    }

   
    if (files.length === 1) {
      const normalizedName = currentSession.name?.trim().toLowerCase();
      if (!normalizedName || normalizedName.startsWith("chat ") || normalizedName === "document analysis") {
        const newName = files[0].name.length > 30
          ? `Document Analysis ${files[0].name.slice(0, 27)}...`
          : `Document Analysis ${files[0].name}`;

        await updateSessionName(newName);
        const updatedSession = { ...currentSession, name: newName };
        setCurrentSession(updatedSession);
        setSessions(prev =>
          [updatedSession, ...prev.filter(s => s.id !== currentSession.id)]
        );
        console.log("✅ Nombre actualizado al nombre del archivo:", updatedSession.name);
      }
    }

    try {
      setIsProcessingFiles(true);
      toast({ title: "Uploading PDFs", description: "Sending to server..." });
      await uploadPDFs(files, currentSession.id);
      toast({ title: "PDFs uploaded", description: "Generating summary..." });

      const aiMessageId = `${Date.now()}-${Math.random()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          content: "",
          sender: "ai",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);
      setIsGenerating(true);

      const reader = await sendPromptStream({
        prompt: "Give me a summary of the PDF document I just uploaded.",
        sessionId: currentSession.id,
      });
      let responseText = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data:"));
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "").trim();
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.answer) {
              responseText += parsed.answer;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: responseText, references: parsed.references ?? [] }
                    : m
                )
              );
            }
          } catch (err) {
            console.warn("Error parsing summary chunk:", jsonStr, err);
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { ...m, content: responseText.trim(), isStreaming: false }
            : m
        )
      );

      const normalizedName = currentSession.name?.trim().toLowerCase();
      const onlyHasAIMessage = messages.length === 1 && messages[0].sender === "ai";
      const isSameAsFilename = files.length === 1 && currentSession.name === files[0].name;

      
      if (!normalizedName || normalizedName.startsWith("chat ") || onlyHasAIMessage || (files.length === 1 && normalizedName === "document analysis")) {
        let newNameSuggestion = "Document Analysis";
        if (files.length === 1 && files[0].name) {
          newNameSuggestion = files[0].name;
        } else if (messages.length > 0 && messages[0].content) {
          newNameSuggestion = messages[0].content.trim().split("\n")[0] || "Document Analysis";
        }

        const newName = newNameSuggestion.length > 30
          ? `${newNameSuggestion.slice(0, 30)}...`
          : newNameSuggestion;

        await updateSessionName(newName);
        const updatedSession = { ...currentSession, name: newName };
        setCurrentSession(updatedSession);
        setSessions(prev =>
          [updatedSession, ...prev.filter(s => s.id !== currentSession.id)]
        );
        console.log("✅ Nombre actualizado (post-summary):", updatedSession.name);
      }

      const token = localStorage.getItem("access_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: currentSession.id,
          sender: "ai",
          content: responseText.trim(),
        }),
      });
    } catch (err: any) {
      toast({
        title: "Summary failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessingFiles(false);
      setIsGenerating(false);
    }
  };


  return {
    messages,
    setMessages,
    input,
    setInput,
    files,
    setFiles,
    isProcessingFiles,
    isGenerating,
    sessions,
    setSessions,
    currentSession,
    setCurrentSession,
    sidebarVisible,
    setSidebarVisible,
    fileInputRef,
    messagesEndRef,
    toggleSidebar,
    createNewSession,
    handleFileUpload,
    handleFileChange,
    removeFile,
    handleSendMessage,
    stopGeneration,
    regenerateResponse,
    loadSession,
    resetChatState,
  }
}
