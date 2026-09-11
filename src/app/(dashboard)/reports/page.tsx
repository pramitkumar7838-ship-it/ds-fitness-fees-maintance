"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { PageLoading } from "@/components/ui/Spinner";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency, formatDate, getFeeStatus, monthName } from "@/lib/feeLogic";
import { downloadCsv } from "@/lib/csv";

export default function ReportsPage() {
  const { members, loading: mLoading } = useMembers();
  const { entries, loading: aLoading } = useAttendance();
  const { payments, loading: pLoading } = usePayments();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const periodKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const report = useMemo(() => {
    const activeMembers = members.filter((m) => m.status !== "Left Gym");
    const monthPayments = payments.filter((p) => p.fee_period === periodKey);
    const collected = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidMemberIds = new Set(monthPayments.map((p) => p.member_id));
    const unpaid = activeMembers.filter((m) => !paidMemberIds.has(m.id));
    const pending = unpaid.reduce((sum, m) => sum + Number(m.monthly_fee), 0);
    const overdueMembers = unpaid.filter((m) => getFeeStatus(m.fee_due_date) === "Overdue");
    const overdueAmount = overdueMembers.reduce((sum, m) => sum + Number(m.monthly_fee), 0);
    const monthAttendance = entries.filter((e) => e.entry_date.startsWith(periodKey)).length;

    return {
      totalActive: activeMembers.length,
      collected,
      pending,
      overdueAmount,
      overdueCount: overdueMembers.length,
      monthAttendance,
      monthPayments,
    };
  }, [members, payments, entries, periodKey]);

  function exportCsv() {
    downloadCsv(
      `ds-fitness-report-${periodKey}.csv`,
      report.monthPayments.map((p) => ({
        Member: p.members?.full_name ?? "",
        MemberCode: p.members?.member_code ?? "",
        Amount: p.amount,
        DueDate: p.due_date,
        PaidDate: p.paid_date,
        Method: p.payment_method,
      }))
    );
  }

  if (mLoading || aLoading || pLoading) return <PageLoading />;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <TopBar title="Reports" subtitle={`${monthName(month)} ${year}`} />
        <div className="flex gap-2 print:hidden">
          <Button variant="ghost" onClick={() => window.print()}>
            Print
          </Button>
          <Button onClick={exportCsv} disabled={report.monthPayments.length === 0}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 print:hidden">
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Card className="p-4">
          <p className="text-xs text-ink-soft">Total Active Members</p>
          <p className="text-xl font-semibold font-display text-ink mt-1">{report.totalActive}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-soft">Monthly Collection</p>
          <p className="text-xl font-semibold font-display text-paid mt-1">{formatCurrency(report.collected)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-soft">Monthly Pending</p>
          <p className="text-xl font-semibold font-display text-due mt-1">{formatCurrency(report.pending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-soft">Overdue Fees</p>
          <p className="text-xl font-semibold font-display text-overdue mt-1">
            {formatCurrency(report.overdueAmount)} <span className="text-xs font-normal">({report.overdueCount})</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-soft">Attendance Count</p>
          <p className="text-xl font-semibold font-display text-ink mt-1">{report.monthAttendance}</p>
        </Card>
      </div>

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Payments this month</h2>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-3">Member</th>
              <th className="text-left font-medium px-4 py-3">Amount</th>
              <th className="text-left font-medium px-4 py-3">Paid Date</th>
              <th className="text-left font-medium px-4 py-3">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {report.monthPayments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-ink-soft py-8">
                  No payments recorded for this month.
                </td>
              </tr>
            )}
            {report.monthPayments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-ink">{p.members?.full_name}</td>
                <td className="px-4 py-3 text-ink">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(p.paid_date)}</td>
                <td className="px-4 py-3 text-ink-soft">{p.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
