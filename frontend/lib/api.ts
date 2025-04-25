
import { useUserStore } from "@/hooks/use-user-store"
export async function registerUser({
  email,
  password,
  full_name,
}: {
  email: string
  password: string
  full_name: string
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, full_name }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || "Registration failed")
  }

  return await res.json()
}

export async function loginUser({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || "Login failed")
  }

  const data = await res.json()

  
  useUserStore.getState().setUser({
    full_name: data.full_name,
    email: data.email,
  })

  return data
}


export async function uploadPDFs(files: File[], sessionId: string) {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No access token found")

  for (const file of files) {
    const formData = new FormData()
    formData.append("session_id", sessionId)
    formData.append("file", file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Upload failed: ${errorText}`)
    }
  }
}

export async function sendPromptStream({
  prompt,
  signal,
  sessionId,
}: {
  prompt: string
  signal?: AbortSignal
  sessionId: string
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rag/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        question: prompt,
        chat_history: [], 
      },
      config: {
        configurable: {
          session_id: sessionId,
        },
      },
    }),
    signal,
  })

  if (!res.ok || !res.body) {
    const errorText = await res.text()
    throw new Error("Stream error: " + errorText)
  }

  return res.body.getReader()
}
export async function createNewChatSession() {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No access token found")

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error("Failed to create chat session: " + error)
  }

  return await res.json()
}




export async function fetchSessions() {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No access token found")

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error("Failed to fetch sessions: " + errorText)
  }

  const data = await res.json()

  return data.map((session: any) => ({
    id: session.session_id,
    name: session.name,
    lastActive: new Date(session.last_active),
  }))
}







export async function deleteChatSession(sessionId: string) {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No access token found")

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error("Failed to delete session: " + errorText)
  }

  return await res.json()
}
