"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Attendance } from "@/lib/types";

export type AttendanceWithMember = Attendance & {
  members: { full_name: string; member_code: string } | null;
};

export function useAttendance(memberId?: string) {
  const supabase = createClient();
  const [entries, setEntries] = useState<AttendanceWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("attendance")
      .select("*, members(full_name, member_code)")
      .order("entry_date", { ascending: false })
      .order("entry_time", { ascending: false });
    if (memberId) query = query.eq("member_id", memberId);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setEntries(data as AttendanceWithMember[]);
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markEntry = useCallback(
    async (member_id: string, entry_date?: string, entry_time?: string) => {
      const now = new Date();
      const payload = {
        member_id,
        entry_date: entry_date ?? now.toISOString().slice(0, 10),
        entry_time: entry_time ?? now.toTimeString().slice(0, 8),
      };
      const { data, error } = await supabase
        .from("attendance")
        .insert(payload)
        .select("*, members(full_name, member_code)")
        .single();
      if (error) throw new Error(error.message);
      setEntries((prev) => [data as AttendanceWithMember, ...prev]);
      return data as AttendanceWithMember;
    },
    [supabase]
  );

  return { entries, loading, error, refresh, markEntry };
}
