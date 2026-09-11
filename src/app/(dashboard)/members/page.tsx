"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import EmptyState from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/Spinner";
import MemberCard from "@/components/members/MemberCard";
import MemberForm from "@/components/members/MemberForm";
import RecordPaymentModal from "@/components/fees/RecordPaymentModal";
import MarkEntryModal from "@/components/attendance/MarkEntryModal";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";
import { currentPeriodKey } from "@/lib/feeLogic";
import type { Member } from "@/lib/types";

type FilterKey = "All" | "Active" | "Inactive" | "Paid" | "Due Soon" | "Overdue";

export default function MembersPage() {
  const { members, loading, addMember, updateMember } = useMembers();
  const { markEntry } = useAttendance();
  const { recordPayment } = usePayments();
  const { settings } = useSettings();
  const { show } = useToast();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [attendanceTarget, setAttendanceTarget] = useState<Member | null>(null);
  const [payingMember, setPayingMember] = useState<Member | null>(null);

  const dueSoonWindow = settings?.reminder_days_before ?? 3;

  const filtered = useMemo(() => {
    let list = members;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.mobile_number.includes(q) ||
          m.member_code.toLowerCase().includes(q)
      );
    }
    if (filter === "Active") list = list.filter((m) => m.status === "Active");
    if (filter === "Inactive") list = list.filter((m) => m.status !== "Active");
    // Fee-based filters computed inline to avoid importing getFeeStatus twice
    if (filter === "Paid" || filter === "Due Soon" || filter === "Overdue") {
      list = list.filter((m) => {
        if (m.status === "Left Gym") return false;
        const diff = Math.round(
          (new Date(m.fee_due_date).getTime() - new Date(new Date().toDateString()).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (filter === "Overdue") return diff < 0;
        if (filter === "Due Soon") return diff >= 0 && diff <= dueSoonWindow;
        return diff > dueSoonWindow;
      });
    }
    return list;
  }, [members, query, filter, dueSoonWindow]);

  async function handleSave(data: Partial<Member>) {
    if (editing) {
      await updateMember(editing.id, data);
      show("Member updated successfully.");
    } else {
      await addMember(data);
      show("Member added successfully.");
    }
  }

  async function handleMark(memberId: string) {
    try {
      await markEntry(memberId);
      show("Attendance marked successfully.");
    } catch {
      show("Unable to mark attendance. Please try again.", "error");
    }
  }

  async function handlePayment(data: { amount: number; paid_date: string; payment_method: any; reference_note?: string }) {
    if (!payingMember) return;
    try {
      await recordPayment({
        member_id: payingMember.id,
        fee_period: currentPeriodKey(),
        amount: data.amount,
        due_date: payingMember.fee_due_date,
        paid_date: data.paid_date,
        payment_method: data.payment_method,
        reference_note: data.reference_note,
        membership_duration_months: payingMember.membership_duration_months,
      });
      show("Payment recorded successfully.");
    } catch {
      show("Unable to save payment. Please try again.", "error");
      throw new Error("failed");
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <TopBar title="Members" subtitle={`${members.length} total`} />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add Member
        </Button>
      </div>

      <TextField
        placeholder="Search member by name, phone number or member ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {(["All", "Active", "Inactive", "Paid", "Due Soon", "Overdue"] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full border ${
              filter === f ? "bg-steel text-white border-steel" : "border-border text-ink-soft hover:bg-bg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No members found." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              dueSoonWindow={dueSoonWindow}
              onMarkEntry={setAttendanceTarget}
              onRecordPayment={setPayingMember}
            />
          ))}
        </div>
      )}

      <MemberForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingMember={editing}
        defaults={{ fee: settings?.default_monthly_fee ?? 1500, dueDay: settings?.default_due_day ?? 5 }}
      />

      <MarkEntryModal
        open={!!attendanceTarget}
        onClose={() => setAttendanceTarget(null)}
        members={attendanceTarget ? [attendanceTarget] : []}
        onMark={handleMark}
      />

      <RecordPaymentModal
        open={!!payingMember}
        onClose={() => setPayingMember(null)}
        member={payingMember}
        onSubmit={handlePayment}
      />
    </div>
  );
}
