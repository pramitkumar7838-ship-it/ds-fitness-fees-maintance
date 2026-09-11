export default function EmptyState({
  icon = "\uD83D\uDCED",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="text-4xl mb-3" aria-hidden>
        {icon}
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
