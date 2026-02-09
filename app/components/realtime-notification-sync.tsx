"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";

/**
 * Subscribes to Supabase Realtime for ticket_replies and tickets.
 * When changes occur, refreshes the page so the notification bell updates.
 */
export function RealtimeNotificationSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel("notification-sync")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_replies" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tickets" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tickets" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
