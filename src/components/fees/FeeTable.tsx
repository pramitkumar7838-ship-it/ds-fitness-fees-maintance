"use client";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { FeeStatusBadge } from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate, getFeeStatus } from "@/lib/feeLogic";
import type { Member } from "@/lib/types";
import type { PaymentWithMember } from "@/hooks/usePayments";

export interface FeeRow {
  member: Member;
  payment: PaymentWithMember | null;
}

export default function FeeTable({
  rows,
  dueSoonWindow,
  onRecordPayment,
}: {
  rows: FeeRow[];
  dueSoonWindow: number;
  onRecordPayment: (m: Member) => void;
}) {
  if (rows.length === 0) {
    return <EmptyState icon="📅" title="No members match this filter for the selected month." />;
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-2 lg:hidden">
        {rows.map(({ member, payment }) => {
          const status = payment ? "Paid" : getFeeStatus(member.fee_due_date, dueSoonWindow);
          const display = status === "Due Later" ? "Paid" : status;
          return (
            <Card key={member.id} className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{member.full_name}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{formatCurrency(member.monthly_fee)}</p>
                </div>
                <FeeStatusBadge status={display} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-ink-soft">
                <span>Due {formatDate(member.fee_due_date)}</span>
                <span>{payment ? `Paid ${formatDate(payment.paid_date)}` : "\u2014"}</span>
              </div>
              {!payment && (
                <Button size="sm" fullWidth className="mt-3" onClick={() => onRecordPayment(member)}>
                  Record Payment
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Desktop: table */}
      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-3">Member</th>
              <th className="text-left font-medium px-4 py-3">Fee</th>
              <th className="text-left font-medium px-4 py-3">Due Date</th>
              <th className="text-left font-medium px-4 py-3">Paid Date</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ member, payment }) => {
              const status = payment ? "Paid" : getFeeStatus(member.fee_due_date, dueSoonWindow);
              const display = status === "Due Later" ? "Paid" : status;
              return (
                <tr key={member.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{member.full_name}</p>
                    <p className="text-xs text-ink-soft">{member.member_code}</p>
                  </td>
                  <td className="px-4 py-3 text-ink">{formatCurrency(member.monthly_fee)}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(member.fee_due_date)}</td>
                  <td className="px-4 py-3 text-ink-soft">{payment ? formatDate(payment.paid_date) : "\u2014"}</td>
                  <td className="px-4 py-3">
                    <FeeStatusBadge status={display} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!payment && (
                      <Button size="sm" onClick={() => onRecordPayment(member)}>
                        Record Payment
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
