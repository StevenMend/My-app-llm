
import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'

export const metadata = {
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>IA Reader pdf</title>
        <meta name="description" content="Chat app for PDF analysis with AI" />
      </head>
      <body className="m-0 p-0 w-full overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}