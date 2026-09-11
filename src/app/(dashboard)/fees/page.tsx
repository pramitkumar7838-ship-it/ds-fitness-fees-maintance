"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import { SelectField } from "@/components/ui/Field";
import { PageLoading } from "@/components/ui/Spinner";
import FeeTable, { type FeeRow } from "@/components/fees/FeeTable";
import RecordPaymentModal from "@/components/fees/RecordPaymentModal";
import { useMembers } from "@/hooks/useMembers";
import { usePayments } from "@/hooks/usePayments";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, getFeeStatus, monthName } from "@/lib/feeLogic";
import type { Member } from "@/lib/types";

type FeeFilter = "All" | "Paid" | "Due Soon" | "Overdue";

export default function FeesPage() {
  const { members, loading: membersLoading } = useMembers();
  const { payments, loading: paymentsLoading, recordPayment } = usePayments();
  const { settings } = useSettings();
  const { show } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [filter, setFilter] = useState<FeeFilter>("All");
  const [payingMember, setPayingMember] = useState<Member | null>(null);

  const periodKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const dueSoonWindow = settings?.reminder_days_before ?? 3;
  const isCurrentMonth = periodKey === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rows: FeeRow[] = useMemo(() => {
    const activeMembers = members.filter((m) => m.status !== "Left Gym");
    return activeMembers.map((member) => {
      const payment = payments.find((p) => p.member_id === member.id && p.fee_period === periodKey) ?? null;
      return { member, payment };
    });
  }, [members, payments, periodKey]);

  const filteredRows = useMemo(() => {
    if (filter === "All") return rows;
    return rows.filter(({ member, payment }) => {
      if (payment) return filter === "Paid";
      if (!isCurrentMonth) return filter === "Overdue" ? false : filter === "Paid" ? false : true;
      const status = getFeeStatus(member.fee_due_date, dueSoonWindow);
      if (filter === "Overdue") return status === "Overdue";
      if (filter === "Due Soon") return status === "Due Soon";
      return false;
    });
  }, [rows, filter, dueSoonWindow, isCurrentMonth]);

  const totals = useMemo(() => {
    const expected = rows.reduce((sum, r) => sum + Number(r.member.monthly_fee), 0);
    const collected = rows
      .filter((r) => r.payment)
      .reduce((sum, r) => sum + Number(r.payment!.amount), 0);
    const overdue = rows.filter(
      (r) => !r.payment && isCurrentMonth && getFeeStatus(r.member.fee_due_date, dueSoonWindow) === "Overdue"
    ).length;
    return { expected, collected, pending: expected - collected, overdue };
  }, [rows, dueSoonWindow, isCurrentMonth]);

  async function handlePayment(data: { amount: number; paid_date: string; payment_method: any; reference_note?: string }) {
    if (!payingMember) return;
    try {
      await recordPayment({
        member_id: payingMember.id,
        fee_period: periodKey,
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

  if (membersLoading || paymentsLoading) return <PageLoading />;

  return (
    <div>
      <TopBar title="Fees" subtitle="Monthly fee record" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <SelectField label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {monthName(i)}
            </option>
          ))}
        </SelectField>
        <SelectField label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card className="p-3.5">
          <p className="text-xs text-ink-soft">Total Members</p>
          <p className="text-lg font-semibold font-display text-ink mt-0.5">{rows.length}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-xs text-ink-soft">Expected Fees</p>
          <p className="text-lg font-semibold font-display text-ink mt-0.5">{formatCurrency(totals.expected)}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-xs text-ink-soft">Collected</p>
          <p className="text-lg font-semibold font-display text-paid mt-0.5">{formatCurrency(totals.collected)}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-xs text-ink-soft">Pending / Overdue</p>
          <p className="text-lg font-semibold font-display text-overdue mt-0.5">
            {formatCurrency(totals.pending)} <span className="text-xs font-normal">({totals.overdue} overdue)</span>
          </p>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4 -mx-1 px-1">
        {(["All", "Paid", "Due Soon", "Overdue"] as FeeFilter[]).map((f) => (
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

      <FeeTable rows={filteredRows} dueSoonWindow={dueSoonWindow} onRecordPayment={setPayingMember} />

      <RecordPaymentModal
        open={!!payingMember}
        onClose={() => setPayingMember(null)}
        member={payingMember}
        onSubmit={handlePayment}
      />
    </div>
  );
}
