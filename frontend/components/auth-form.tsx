"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser, loginUser } from "@/lib/api"
import { useUserStore } from "@/hooks/use-user-store" 
import useChatLogic from "@/app/chat/components/useChatLogic"



export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()
  const chat = useChatLogic()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    try {
      if (isLogin) {
        const res = await loginUser({ email: email.trim().toLowerCase(), password })
        console.log("Login successful:", res)
  
        localStorage.setItem("access_token", res.access_token)
  
        useUserStore.getState().setUser({
          full_name: res.full_name,
          email: res.email,
        })
  
        chat.resetChatState()
        localStorage.removeItem("last_session_id")
        await chat.createNewSession()
  
        window.location.href = "/chat"
      } else {
        const res = await registerUser({
          email: email.trim().toLowerCase(),
          password,
          full_name: name.trim()
        })
  
        console.log("Registration successful:", res)
        localStorage.setItem("access_token", res.access_token)
  
        useUserStore.getState().setUser({
          full_name: res.full_name,
          email: res.email,
        })
  
        chat.resetChatState()
        await chat.createNewSession()
  
        router.push("/chat")
      }
    } catch (err: any) {
      console.error("Error:", err.message)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{isLogin ? "Log in to your account" : "Create a free account"}</h1>
        <p className="text-gray-500">
          {isLogin ? "Access your AI assistant" : "Your virtual demo assistant for document tasks."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name*
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email*
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password*
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md border border-gray-300"
          />
        </div>

        <Button type="submit" className="w-full py-6 bg-black text-white rounded-full hover:bg-gray-800">
          {isLogin ? "Log in" : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {isLogin ? (
          <p>
            Don&apos;t have an account?{" "}
            <button onClick={() => setIsLogin(false)} className="text-blue-600 hover:underline">
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button onClick={() => setIsLogin(true)} className="text-blue-600 hover:underline">
              Log in
            </button>
          </p>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline">
            terms of use
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
