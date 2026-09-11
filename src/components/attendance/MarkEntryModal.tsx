"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField } from "@/components/ui/Field";
import type { Member } from "@/lib/types";

export default function MarkEntryModal({
  open,
  onClose,
  members,
  onMark,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  onMark: (memberId: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const active = members.filter((m) => m.status === "Active");
    if (!q) return active.slice(0, 20);
    return active.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.mobile_number.includes(q) ||
        m.member_code.toLowerCase().includes(q)
    );
  }, [members, query]);

  async function handleMark(id: string) {
    setMarkingId(id);
    try {
      await onMark(id);
      onClose();
      setQuery("");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark Entry">
      <TextField
        placeholder="Search member by name, phone or ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="mt-3 space-y-1.5 max-h-72 overflow-y-auto">
        {filtered.length === 0 && <p className="text-sm text-ink-soft py-4 text-center">No matching members.</p>}
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => handleMark(m.id)}
            disabled={markingId !== null}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-bg text-left disabled:opacity-50"
          >
            <span>
              <span className="block text-sm font-medium text-ink">{m.full_name}</span>
              <span className="block text-xs text-ink-soft">
                {m.member_code} &middot; {m.mobile_number}
              </span>
            </span>
            <span className="text-xs font-medium text-brand shrink-0">
              {markingId === m.id ? "Marking\u2026" : "Mark In"}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
