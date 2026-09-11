"use client";

import { useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { PageLoading } from "@/components/ui/Spinner";
import ReminderList from "@/components/dashboard/ReminderList";
import { useMembers } from "@/hooks/useMembers";
import { useSettings } from "@/hooks/useSettings";
import { getFeeStatus } from "@/lib/feeLogic";

export default function RemindersPage() {
  const { members, loading } = useMembers();
  const { settings } = useSettings();
  const dueSoonWindow = settings?.reminder_days_before ?? 3;

  const { dueSoon, overdue } = useMemo(() => {
    const active = members.filter((m) => m.status !== "Left Gym");
    const dueSoon = active
      .filter((m) => getFeeStatus(m.fee_due_date, dueSoonWindow) === "Due Soon")
      .sort((a, b) => a.fee_due_date.localeCompare(b.fee_due_date));
    const overdue = active
      .filter((m) => getFeeStatus(m.fee_due_date, dueSoonWindow) === "Overdue")
      .sort((a, b) => a.fee_due_date.localeCompare(b.fee_due_date));
    return { dueSoon, overdue };
  }, [members, dueSoonWindow]);

  if (loading) return <PageLoading />;

  return (
    <div>
      <TopBar title="Fee Reminders" subtitle="Upcoming and overdue payments" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold font-display text-due">{dueSoon.length}</p>
          <p className="text-xs text-ink-soft mt-0.5">Fees due soon</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold font-display text-overdue">{overdue.length}</p>
          <p className="text-xs text-ink-soft mt-0.5">Fees overdue</p>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-3">🔴 Overdue</h2>
        <ReminderList members={overdue} gymName={settings?.gym_name || "DS FITNESS"} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">🟡 Due Soon</h2>
        <ReminderList members={dueSoon} gymName={settings?.gym_name || "DS FITNESS"} />
      </section>
    </div>
  );
}
