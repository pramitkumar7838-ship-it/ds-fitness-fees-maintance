import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, formatTime } from "@/lib/feeLogic";
import type { AttendanceWithMember } from "@/hooks/useAttendance";
import type { Attendance } from "@/lib/types";

export default function AttendanceList({
  entries,
  showDate = true,
  emptyMessage = "No entries recorded yet.",
}: {
  entries: (AttendanceWithMember | Attendance)[];
  showDate?: boolean;
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return <EmptyState icon="🚪" title={emptyMessage} />;
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <Card key={e.id} className="p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {"members" in e && e.members ? e.members.full_name : "Member"}
            </p>
            {showDate && <p className="text-xs text-ink-soft mt-0.5">{formatDate(e.entry_date)}</p>}
          </div>
          <p className="text-sm font-semibold text-steel shrink-0">{formatTime(e.entry_time)}</p>
        </Card>
      ))}
    </div>
  );
}
