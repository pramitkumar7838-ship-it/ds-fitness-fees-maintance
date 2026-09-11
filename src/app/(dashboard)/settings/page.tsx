"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { TextField, SelectField } from "@/components/ui/Field";
import { PageLoading } from "@/components/ui/Spinner";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const { show } = useToast();
  const [form, setForm] = useState({
    gym_name: "",
    admin_name: "",
    currency: "INR",
    default_monthly_fee: 1500,
    default_due_day: 5,
    reminder_days_before: 3,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        gym_name: settings.gym_name,
        admin_name: settings.admin_name,
        currency: settings.currency,
        default_monthly_fee: settings.default_monthly_fee,
        default_due_day: settings.default_due_day,
        reminder_days_before: settings.reminder_days_before,
      });
    }
  }, [settings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      show("Settings saved successfully.");
    } catch {
      show("Unable to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div>
      <TopBar title="Settings" subtitle="Gym and admin preferences" />

      <Card className="p-5 max-w-lg">
        <form className="space-y-4" onSubmit={handleSave}>
          <TextField
            label="Admin Name"
            value={form.admin_name}
            onChange={(e) => setForm((f) => ({ ...f, admin_name: e.target.value }))}
          />
          <TextField
            label="Gym Name"
            value={form.gym_name}
            onChange={(e) => setForm((f) => ({ ...f, gym_name: e.target.value }))}
          />
          <SelectField
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
          </SelectField>
          <TextField
            label="Default Monthly Fee"
            type="number"
            min={0}
            value={form.default_monthly_fee}
            onChange={(e) => setForm((f) => ({ ...f, default_monthly_fee: Number(e.target.value) }))}
          />
          <TextField
            label="Default Fee Due Day"
            type="number"
            min={1}
            max={31}
            value={form.default_due_day}
            onChange={(e) => setForm((f) => ({ ...f, default_due_day: Number(e.target.value) }))}
            hint="Day of the month new members default to."
          />
          <TextField
            label="Reminder Window (days before due date)"
            type="number"
            min={1}
            max={30}
            value={form.reminder_days_before}
            onChange={(e) => setForm((f) => ({ ...f, reminder_days_before: Number(e.target.value) }))}
            hint="Fees within this many days count as 'Due Soon'."
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving\u2026" : "Save Settings"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
