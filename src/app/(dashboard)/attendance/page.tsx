"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Spinner";
import AttendanceList from "@/components/attendance/AttendanceList";
import MarkEntryModal from "@/components/attendance/MarkEntryModal";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { useToast } from "@/components/ui/Toast";

export default function AttendancePage() {
  const { members } = useMembers();
  const { entries, loading, markEntry } = useAttendance();
  const { show } = useToast();
  const [markOpen, setMarkOpen] = useState(false);
  const [view, setView] = useState<"today" | "all">("today");

  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = useMemo(() => entries.filter((e) => e.entry_date === today), [entries, today]);

  const monthlyCount = useMemo(() => {
    const month = today.slice(0, 7);
    return entries.filter((e) => e.entry_date.startsWith(month)).length;
  }, [entries, today]);

  async function handleMark(memberId: string) {
    try {
      await markEntry(memberId);
      show("Attendance marked successfully.");
    } catch {
      show("Unable to mark attendance. Please try again.", "error");
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <TopBar title="Attendance" subtitle={`${monthlyCount} entries this month`} />
        <Button onClick={() => setMarkOpen(true)}>+ Mark Entry</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("today")}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border ${
            view === "today" ? "bg-steel text-white border-steel" : "border-border text-ink-soft hover:bg-bg"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView("all")}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border ${
            view === "all" ? "bg-steel text-white border-steel" : "border-border text-ink-soft hover:bg-bg"
          }`}
        >
          All Entries
        </button>
      </div>

      <AttendanceList
        entries={view === "today" ? todaysEntries : entries}
        showDate={view === "all"}
        emptyMessage={view === "today" ? "No entries recorded today." : "No attendance records yet."}
      />

      <MarkEntryModal open={markOpen} onClose={() => setMarkOpen(false)} members={members} onMark={handleMark} />
    </div>
  );
}
