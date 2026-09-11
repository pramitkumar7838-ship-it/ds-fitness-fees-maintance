"use client";

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>}
    </div>
  );
}
