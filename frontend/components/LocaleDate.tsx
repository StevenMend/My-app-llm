"use client"
import { useEffect, useState } from "react"

export default function LocaleDate({ date }: { date: Date }) {
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setFormattedDate(date.toLocaleDateString())
  }, [date])

  return <span className="text-xs text-gray-500">{formattedDate}</span>
}
