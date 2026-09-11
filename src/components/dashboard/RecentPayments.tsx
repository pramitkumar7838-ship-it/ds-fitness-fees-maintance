import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatCurrency, formatShortDate } from "@/lib/feeLogic";
import type { PaymentWithMember } from "@/hooks/usePayments";

export default function RecentPayments({ payments, limit = 5 }: { payments: PaymentWithMember[]; limit?: number }) {
  const list = payments.slice(0, limit);

  if (list.length === 0) {
    return <EmptyState icon="🧾" title="No payments recorded for this month." />;
  }

  return (
    <div className="space-y-2">
      {list.map((p) => (
        <Card key={p.id} className="p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{p.members?.full_name ?? "Member"}</p>
            <p className="text-xs text-ink-soft mt-0.5">
              Paid {formatShortDate(p.paid_date)} &middot; {p.payment_method}
            </p>
          </div>
          <p className="text-sm font-semibold text-paid shrink-0">{formatCurrency(p.amount)}</p>
        </Card>
      ))}
    </div>
  );
}
