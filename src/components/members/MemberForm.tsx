"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { TextField, SelectField, TextAreaField } from "@/components/ui/Field";
import { computeNextDueDate } from "@/lib/feeLogic";
import type { Member, MemberStatus } from "@/lib/types";

type FormState = {
  full_name: string;
  mobile_number: string;
  email: string;
  gender: "Male" | "Female" | "Other" | "";
  date_of_birth: string;
  joining_date: string;
  membership_plan: string;
  membership_duration_months: number;
  monthly_fee: number;
  fee_due_date: string;
  emergency_contact: string;
  address: string;
  status: MemberStatus;
};

function defaultState(defaults: { fee: number; dueDay: number }): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    full_name: "",
    mobile_number: "",
    email: "",
    gender: "",
    date_of_birth: "",
    joining_date: today,
    membership_plan: "Standard",
    membership_duration_months: 1,
    monthly_fee: defaults.fee,
    fee_due_date: computeNextDueDate(today, 1),
    emergency_contact: "",
    address: "",
    status: "Active",
  };
}

function memberToForm(m: Member): FormState {
  return {
    full_name: m.full_name,
    mobile_number: m.mobile_number,
    email: m.email ?? "",
    gender: m.gender ?? "",
    date_of_birth: m.date_of_birth ?? "",
    joining_date: m.joining_date,
    membership_plan: m.membership_plan,
    membership_duration_months: m.membership_duration_months,
    monthly_fee: m.monthly_fee,
    fee_due_date: m.fee_due_date,
    emergency_contact: m.emergency_contact ?? "",
    address: m.address ?? "",
    status: m.status,
  };
}

export default function MemberForm({
  open,
  onClose,
  onSave,
  editingMember,
  defaults,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void>;
  editingMember?: Member | null;
  defaults: { fee: number; dueDay: number };
}) {
  const [form, setForm] = useState<FormState>(() =>
    editingMember ? memberToForm(editingMember) : defaultState(defaults)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleJoiningDateChange(value: string) {
    setForm((prev) => ({
      ...prev,
      joining_date: value,
      fee_due_date: editingMember ? prev.fee_due_date : computeNextDueDate(value, prev.membership_duration_months),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.mobile_number.trim()) {
      setError("Name and mobile number are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...form,
        email: form.email || null,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        emergency_contact: form.emergency_contact || null,
        address: form.address || null,
      } as Partial<Member>);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save member. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingMember ? "Edit Member" : "Add New Member"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving\u2026" : editingMember ? "Save Changes" : "Add Member"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-overdue">{error}</p>}

        <TextField
          label="Full Name"
          required
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Mobile Number"
            type="tel"
            required
            value={form.mobile_number}
            onChange={(e) => set("mobile_number", e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Gender" value={form.gender} onChange={(e) => set("gender", e.target.value as any)}>
            <option value="">Not specified</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </SelectField>
          <TextField
            label="Date of Birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) => set("date_of_birth", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Joining Date"
            type="date"
            required
            value={form.joining_date}
            onChange={(e) => handleJoiningDateChange(e.target.value)}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value as MemberStatus)}
          >
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Left Gym">Left Gym</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Membership Plan"
            required
            value={form.membership_plan}
            onChange={(e) => set("membership_plan", e.target.value)}
          />
          <SelectField
            label="Duration"
            value={form.membership_duration_months}
            onChange={(e) => set("membership_duration_months", Number(e.target.value))}
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Monthly Fee"
            type="number"
            required
            min={0}
            value={form.monthly_fee}
            onChange={(e) => set("monthly_fee", Number(e.target.value))}
          />
          <TextField
            label="Fee Due Date"
            type="date"
            required
            value={form.fee_due_date}
            onChange={(e) => set("fee_due_date", e.target.value)}
          />
        </div>

        <TextField
          label="Emergency Contact"
          value={form.emergency_contact}
          onChange={(e) => set("emergency_contact", e.target.value)}
        />
        <TextAreaField label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
      </form>
    </Modal>
  );
}
