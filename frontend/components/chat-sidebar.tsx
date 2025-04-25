"use client"

import { Input } from "@/components/ui/input"
import { Clock, Search, Trash2 } from "lucide-react"
import React, { useState, useMemo } from "react"
import { useUserStore } from "../hooks/use-user-store"
import LocaleDate from "./LocaleDate"
import { deleteChatSession } from "@/lib/api"
import { logoutUser } from "@/lib/logout"
import { LogOut } from "lucide-react"
interface Session {
  id: string
  name: string
  lastActive: Date
}

interface ChatSidebarProps {
  sessions: Session[]
  currentSession: Session
  onSessionSelect: (sessionId: string) => void
  sidebarVisible: boolean
  setSessions: (sessions: Session[]) => void
  className?: string
}

export default function ChatSidebar({
  sessions,
  currentSession,
  onSessionSelect,
  sidebarVisible,
  setSessions,
  className = ""
}: ChatSidebarProps) {
  const { user } = useUserStore()
  const initial = user?.full_name?.charAt(0)?.toUpperCase() ?? "U"

  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredSessions = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return sessions
      .filter((s) => s.name.toLowerCase().includes(q))
      .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
  }, [searchQuery, sessions])

  const handleDelete = async (sessionId: string) => {
    if (deletingId) return
    setDeletingId(sessionId)
    try {
      await deleteChatSession(sessionId)
      setSessions(sessions.filter((s) => s.id !== sessionId))
      if (currentSession.id === sessionId && sessions.length > 1) {
        const nextSession = sessions.find(s => s.id !== sessionId)
        if (nextSession) onSessionSelect(nextSession.id)
      }
    } catch (err) {
      console.error("Error deleting session:", err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      className={`w-64 border-r border-gray-200 bg-gray-50 flex flex-col md:static fixed z-30 h-full top-0 left-0 transition-transform transform ${
        sidebarVisible ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 ${className}`}
    >
      {/* User */}
      <div className="flex items-center justify-between px-4 pt-4 h-[74px]">
        <div className="flex items-start">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold mr-3">
            {initial}
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-base font-medium text-gray-900">
              {user?.full_name || "Usuario"}
            </span>
            <span className="text-sm text-gray-500">
              {user?.email || "usuario@ejemplo.com"}
            </span>
          </div>
        </div>

        <button
          onClick={logoutUser}
          title="Logout"
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-2 pb-0">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 py-1 h-8 text-sm"
          />
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Recent Conversations
        </h3>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 max-h-[calc(100vh-160px)]">
        <ul className="space-y-1 pb-10">
          {filteredSessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between group">
              <button
                className={`flex-1 text-left text-sm font-normal rounded-md px-2 py-1 truncate ${
                  currentSession?.id === session.id
                    ? "bg-gray-200 font-medium"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="truncate">{session.name}</div>
                <div className="text-xs text-gray-500">
                  <LocaleDate date={session.lastActive} />
                </div>
              </button>

              <button
                className={`text-gray-400 hover:text-red-600 p-1 ml-1 ${
                  deletingId === session.id ? "opacity-50" : ""
                }`}
                onClick={() => handleDelete(session.id)}
                title="delete sesion"
                disabled={deletingId === session.id}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}