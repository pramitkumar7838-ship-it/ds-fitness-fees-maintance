"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";

export function useMembers() {
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setMembers(data as Member[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMember = useCallback(
    async (input: Partial<Member>) => {
      const { data, error } = await supabase.from("members").insert(input).select().single();
      if (error) throw new Error(error.message);
      setMembers((prev) => [data as Member, ...prev]);
      return data as Member;
    },
    [supabase]
  );

  const updateMember = useCallback(
    async (id: string, input: Partial<Member>) => {
      const { data, error } = await supabase
        .from("members")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      setMembers((prev) => prev.map((m) => (m.id === id ? (data as Member) : m)));
      return data as Member;
    },
    [supabase]
  );

  const setMemberStatus = useCallback(
    async (id: string, status: Member["status"]) => {
      return updateMember(id, { status });
    },
    [updateMember]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    },
    [supabase]
  );

  return { members, loading, error, refresh, addMember, updateMember, setMemberStatus, deleteMember };
}
