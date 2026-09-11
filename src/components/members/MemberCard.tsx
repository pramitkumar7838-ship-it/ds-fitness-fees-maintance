"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { FeeStatusBadge, MemberStatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate, getFeeStatus } from "@/lib/feeLogic";
import type { Member } from "@/lib/types";

export default function MemberCard({
  member,
  dueSoonWindow,
  onMarkEntry,
  onRecordPayment,
}: {
  member: Member;
  dueSoonWindow: number;
  onMarkEntry: (m: Member) => void;
  onRecordPayment: (m: Member) => void;
}) {
  const feeStatus =
    member.status === "Left Gym" ? null : getFeeStatus(member.fee_due_date, dueSoonWindow);
  const displayFeeStatus = feeStatus === "Due Later" ? "Paid" : feeStatus;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/members/${member.id}`} className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">{member.full_name}</p>
          <p className="text-xs text-ink-soft mt-0.5">
            {member.member_code} &middot; {member.mobile_number}
          </p>
        </Link>
        <MemberStatusBadge status={member.status} />
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="text-ink-soft">{member.membership_plan}</span>
        <span className="font-medium text-ink">{formatCurrency(member.monthly_fee)}/mo</span>
      </div>

      {member.status !== "Left Gym" && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-ink-soft">Due {formatDate(member.fee_due_date)}</span>
          {displayFeeStatus && <FeeStatusBadge status={displayFeeStatus} />}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Link
          href={`/members/${member.id}`}
          className="text-center text-xs font-medium py-2 rounded-lg border border-border text-ink hover:bg-bg"
        >
          View
        </Link>
        <button
          onClick={() => onMarkEntry(member)}
          className="text-center text-xs font-medium py-2 rounded-lg border border-border text-ink hover:bg-bg"
        >
          Attendance
        </button>
        <button
          onClick={() => onRecordPayment(member)}
          className="text-center text-xs font-medium py-2 rounded-lg bg-brand text-white hover:bg-brand-dark"
        >
          Payment
        </button>
      </div>
    </Card>
  );
}
