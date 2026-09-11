export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-border border-t-brand w-5 h-5 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
