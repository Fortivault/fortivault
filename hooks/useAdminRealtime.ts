"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Tables = "cases" | "messages" | "agents"

export function useAdminRealtime(onEvent: (table: Tables, payload: any) => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, (payload) =>
        onEvent("cases", payload),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) =>
        onEvent("messages", payload),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "agents" }, (payload) =>
        onEvent("agents", payload),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onEvent])
}
