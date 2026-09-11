"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/types";

export function useSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
    setSettings(data as Settings);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSettings = useCallback(
    async (input: Partial<Settings>) => {
      const { data, error } = await supabase
        .from("settings")
        .update(input)
        .eq("id", 1)
        .select()
        .single();
      if (error) throw new Error(error.message);
      setSettings(data as Settings);
      return data as Settings;
    },
    [supabase]
  );

  return { settings, loading, refresh, updateSettings };
}
