"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { TextField, SelectField } from "@/components/ui/Field";
import { currentPeriodKey } from "@/lib/feeLogic";
import type { Member, PaymentMethod } from "@/lib/types";

export default function RecordPaymentModal({
  open,
  onClose,
  member,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onSubmit: (data: {
    amount: number;
    paid_date: string;
    payment_method: PaymentMethod;
    reference_note?: string;
  }) => Promise<void>;
}) {
  const [amount, setAmount] = useState(member?.monthly_fee ?? 0);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!member) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ amount, paid_date: paidDate, payment_method: method, reference_note: note || undefined });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save payment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Record Payment \u2014 ${member.full_name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving\u2026" : "Save Payment"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-overdue">{error}</p>}
        <p className="text-xs text-ink-soft">
          Fee period: <span className="font-medium text-ink">{currentPeriodKey()}</span> &middot; Due date:{" "}
          <span className="font-medium text-ink">{member.fee_due_date}</span>
        </p>
        <TextField
          label="Amount"
          type="number"
          required
          min={0}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <TextField
          label="Paid Date"
          type="date"
          required
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
        />
        <SelectField label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </SelectField>
        <TextField
          label="Reference / Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. UPI transaction ID"
        />
      </form>
    </Modal>
  );
}
