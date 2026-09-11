import type { FeeStatus, MemberStatus } from "@/lib/types";

const feeStyles: Record<FeeStatus, string> = {
  Paid: "bg-paid-bg text-paid",
  "Due Soon": "bg-due-bg text-due",
  Overdue: "bg-overdue-bg text-overdue",
  "Due Later": "bg-bg text-ink-soft",
};

const feeIcons: Record<FeeStatus, string> = {
  Paid: "\uD83D\uDFE2",
  "Due Soon": "\uD83D\uDFE1",
  Overdue: "\uD83D\uDD34",
  "Due Later": "\u26AA",
};

export function FeeStatusBadge({ status }: { status: FeeStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${feeStyles[status]}`}
    >
      <span aria-hidden>{feeIcons[status]}</span>
      {status}
    </span>
  );
}

const memberStyles: Record<MemberStatus, string> = {
  Active: "bg-paid-bg text-paid",
  Expired: "bg-due-bg text-due",
  "Left Gym": "bg-bg text-ink-soft",
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${memberStyles[status]}`}>
      {status}
    </span>
  );
}
