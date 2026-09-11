"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import StatsCard from "@/components/dashboard/StatsCard";
import ReminderList from "@/components/dashboard/ReminderList";
import RecentPayments from "@/components/dashboard/RecentPayments";
import AttendanceList from "@/components/attendance/AttendanceList";
import MarkEntryModal from "@/components/attendance/MarkEntryModal";
import RecordPaymentModal from "@/components/fees/RecordPaymentModal";
import Button from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Spinner";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, getFeeStatus, currentPeriodKey } from "@/lib/feeLogic";
import type { Member } from "@/lib/types";

export default function DashboardPage() {
  const { members, loading: membersLoading } = useMembers();
  const { entries, markEntry } = useAttendance();
  const { payments, recordPayment } = usePayments();
  const { settings } = useSettings();
  const { show } = useToast();

  const [markOpen, setMarkOpen] = useState(false);
  const [payingMember, setPayingMember] = useState<Member | null>(null);

  const dueSoonWindow = settings?.reminder_days_before ?? 3;
  const today = new Date().toISOString().slice(0, 10);
  const period = currentPeriodKey();

  const activeMembers = members.filter((m) => m.status !== "Left Gym");
  const todaysEntries = entries.filter((e) => e.entry_date === today);
  const collectedThisMonth = payments
    .filter((p) => p.fee_period === period)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const dueList = useMemo(() => {
    return activeMembers
      .filter((m) => getFeeStatus(m.fee_due_date, dueSoonWindow) !== "Due Later")
      .sort((a, b) => a.fee_due_date.localeCompare(b.fee_due_date));
  }, [activeMembers, dueSoonWindow]);

  const dueSoonCount = dueList.filter((m) => getFeeStatus(m.fee_due_date, dueSoonWindow) === "Due Soon").length;
  const overdueCount = dueList.filter((m) => getFeeStatus(m.fee_due_date, dueSoonWindow) === "Overdue").length;

  async function handleMarkEntry(memberId: string) {
    try {
      await markEntry(memberId);
      show("Attendance marked successfully.");
    } catch {
      show("Unable to mark attendance. Please try again.", "error");
    }
  }

  async function handlePayment(data: {
    amount: number;
    paid_date: string;
    payment_method: any;
    reference_note?: string;
  }) {
    if (!payingMember) return;
    try {
      await recordPayment({
        member_id: payingMember.id,
        fee_period: period,
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

  if (membersLoading) return <PageLoading />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <TopBar title={settings?.gym_name || "DS FITNESS"} subtitle="Fee Management Dashboard" />
        <Button onClick={() => setMarkOpen(true)}>+ Mark Entry</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <StatsCard icon="👥" label="Total Members" value={members.length} />
        <StatsCard icon="🟢" label="Active Members" value={activeMembers.length} tone="paid" />
        <StatsCard icon="🚪" label="Today's Entries" value={todaysEntries.length} />
        <StatsCard icon="💰" label="Fees Collected" value={formatCurrency(collectedThisMonth)} tone="brand" />
        <StatsCard icon="🟡" label="Fees Due Soon" value={dueSoonCount} tone="due" />
        <StatsCard icon="🔴" label="Overdue Fees" value={overdueCount} tone="overdue" />
      </div>

      <section className="mb-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-3">Today&rsquo;s Entries</h2>
        <AttendanceList entries={todaysEntries} showDate={false} emptyMessage="No entries recorded today." />
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-ink">🔔 Fee Reminders</h2>
          <p className="text-xs text-ink-soft">
            {dueSoonCount} due soon &middot; {overdueCount} overdue
          </p>
        </div>
        <ReminderList members={dueList} gymName={settings?.gym_name || "DS FITNESS"} limit={5} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">Recent Payments</h2>
        <RecentPayments payments={payments} />
      </section>

      <MarkEntryModal open={markOpen} onClose={() => setMarkOpen(false)} members={members} onMark={handleMarkEntry} />
      <RecordPaymentModal
        open={!!payingMember}
        onClose={() => setPayingMember(null)}
        member={payingMember}
        onSubmit={handlePayment}
      />
    </div>
  );
}
