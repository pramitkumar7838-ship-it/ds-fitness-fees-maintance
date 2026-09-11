import Card from "@/components/ui/Card";

export default function StatsCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: string | number;
  tone?: "default" | "paid" | "due" | "overdue" | "brand";
}) {
  const toneClasses: Record<string, string> = {
    default: "text-ink",
    paid: "text-paid",
    due: "text-due",
    overdue: "text-overdue",
    brand: "text-brand",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl" aria-hidden>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-ink-soft truncate">{label}</p>
          <p className={`text-xl font-semibold font-display ${toneClasses[tone]}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
