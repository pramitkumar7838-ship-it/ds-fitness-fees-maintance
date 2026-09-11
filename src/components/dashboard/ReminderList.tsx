"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatCurrency, getFeeStatusLabel } from "@/lib/feeLogic";
import { buildWhatsAppReminderUrl } from "@/lib/whatsapp";
import type { Member } from "@/lib/types";

export default function ReminderList({
  members,
  gymName,
  limit,
}: {
  members: Member[];
  gymName: string;
  limit?: number;
}) {
  const list = limit ? members.slice(0, limit) : members;

  if (list.length === 0) {
    return <EmptyState icon="🎉" title="No pending fee reminders" description="Everyone is paid up." />;
  }

  return (
    <div className="space-y-2">
      {list.map((m) => {
        const label = getFeeStatusLabel(m.fee_due_date);
        const isOverdue = label.includes("overdue");
        return (
          <Card key={m.id} className="p-3.5 flex items-center justify-between gap-3">
            <Link href={`/members/${m.id}`} className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">{m.full_name}</p>
              <p className={`text-xs mt-0.5 ${isOverdue ? "text-overdue" : "text-due"}`}>
                {formatCurrency(m.monthly_fee)} &middot; {label}
              </p>
            </Link>
            <a
              href={buildWhatsAppReminderUrl({
                gymName,
                memberName: m.full_name,
                mobileNumber: m.mobile_number,
                amount: m.monthly_fee,
                dueDateIso: m.fee_due_date,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-medium bg-paid-bg text-paid px-3 py-2 rounded-lg hover:brightness-95"
            >
              WhatsApp
            </a>
          </Card>
        );
      })}
    </div>
  );
}
