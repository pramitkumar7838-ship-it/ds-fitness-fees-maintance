"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PageLoading } from "@/components/ui/Spinner";
import { MemberStatusBadge, FeeStatusBadge } from "@/components/ui/StatusBadge";
import MemberForm from "@/components/members/MemberForm";
import RecordPaymentModal from "@/components/fees/RecordPaymentModal";
import MarkEntryModal from "@/components/attendance/MarkEntryModal";
import AttendanceList from "@/components/attendance/AttendanceList";
import EmptyState from "@/components/ui/EmptyState";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayments } from "@/hooks/usePayments";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";
import { buildWhatsAppReminderUrl } from "@/lib/whatsapp";
import { currentPeriodKey, formatCurrency, formatDate, getFeeStatus } from "@/lib/feeLogic";
import type { Member } from "@/lib/types";

type Tab = "Overview" | "Attendance" | "Payments" | "Fee History";

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { members, loading, updateMember, setMemberStatus, deleteMember } = useMembers();
  const { entries, markEntry } = useAttendance(params.id);
  const { payments, recordPayment } = usePayments(params.id);
  const { settings } = useSettings();
  const { show } = useToast();

  const [tab, setTab] = useState<Tab>("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [attendOpen, setAttendOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const member = members.find((m) => m.id === params.id);

  if (loading) return <PageLoading />;
  if (!member) {
    return (
      <EmptyState
        title="Member not found."
        action={
          <Link href="/members">
            <Button variant="ghost">Back to Members</Button>
          </Link>
        }
      />
    );
  }

  const dueSoonWindow = settings?.reminder_days_before ?? 3;
  const feeStatus = member.status === "Left Gym" ? null : getFeeStatus(member.fee_due_date, dueSoonWindow);

  async function handleSave(data: Partial<Member>) {
    await updateMember(member!.id, data);
    show("Member updated successfully.");
  }

  async function handleMoveToLeft() {
    setBusy(true);
    try {
      await setMemberStatus(member!.id, "Left Gym");
      show("Member moved to Left Gym. History preserved.");
      setRemoveOpen(false);
    } catch {
      show("Unable to update member. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteMember(member!.id);
      show("Member removed successfully.");
      router.push("/members");
    } catch {
      show("Unable to remove member. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handlePayment(data: { amount: number; paid_date: string; payment_method: any; reference_note?: string }) {
    try {
      await recordPayment({
        member_id: member!.id,
        fee_period: currentPeriodKey(),
        amount: data.amount,
        due_date: member!.fee_due_date,
        paid_date: data.paid_date,
        payment_method: data.payment_method,
        reference_note: data.reference_note,
        membership_duration_months: member!.membership_duration_months,
      });
      show("Payment recorded successfully.");
    } catch {
      show("Unable to save payment. Please try again.", "error");
      throw new Error("failed");
    }
  }

  async function handleMarkEntry(memberId: string) {
    try {
      await markEntry(memberId);
      show("Attendance marked successfully.");
    } catch {
      show("Unable to mark attendance. Please try again.", "error");
    }
  }

  return (
    <div>
      <Link href="/members" className="text-sm text-ink-soft hover:text-ink mb-3 inline-block">
        &larr; Back to Members
      </Link>

      <Card className="p-5 mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{member.full_name}</h1>
            <p className="text-sm text-ink-soft mt-0.5">
              {member.member_code} &middot; {member.mobile_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MemberStatusBadge status={member.status} />
            {feeStatus && <FeeStatusBadge status={feeStatus === "Due Later" ? "Paid" : feeStatus} />}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
          <div>
            <p className="text-ink-soft text-xs">Joining Date</p>
            <p className="font-medium text-ink mt-0.5">{formatDate(member.joining_date)}</p>
          </div>
          <div>
            <p className="text-ink-soft text-xs">Membership Plan</p>
            <p className="font-medium text-ink mt-0.5">{member.membership_plan}</p>
          </div>
          <div>
            <p className="text-ink-soft text-xs">Monthly Fee</p>
            <p className="font-medium text-ink mt-0.5">{formatCurrency(member.monthly_fee)}</p>
          </div>
          <div>
            <p className="text-ink-soft text-xs">Next Due Date</p>
            <p className="font-medium text-ink mt-0.5">{formatDate(member.fee_due_date)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <Button size="sm" onClick={() => setPayOpen(true)}>
            Record Payment
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setAttendOpen(true)}>
            Mark Entry
          </Button>
          <a
            href={buildWhatsAppReminderUrl({
              gymName: settings?.gym_name || "DS FITNESS",
              memberName: member.full_name,
              mobileNumber: member.mobile_number,
              amount: member.monthly_fee,
              dueDateIso: member.fee_due_date,
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="ghost">
              Send WhatsApp Reminder
            </Button>
          </a>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          {member.status !== "Left Gym" ? (
            <Button size="sm" variant="ghost" onClick={() => setRemoveOpen(true)}>
              Remove
            </Button>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete Permanently
            </Button>
          )}
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto mb-4 -mx-1 px-1">
        {(["Overview", "Attendance", "Payments", "Fee History"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full border ${
              tab === t ? "bg-steel text-white border-steel" : "border-border text-ink-soft hover:bg-bg"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <Card className="p-5 text-sm space-y-3">
          <Row label="Gender" value={member.gender || "\u2014"} />
          <Row label="Date of Birth" value={formatDate(member.date_of_birth)} />
          <Row label="Email" value={member.email || "\u2014"} />
          <Row label="Emergency Contact" value={member.emergency_contact || "\u2014"} />
          <Row label="Address" value={member.address || "\u2014"} />
          <Row label="Membership Duration" value={`${member.membership_duration_months} month(s)`} />
        </Card>
      )}

      {tab === "Attendance" && <AttendanceList entries={entries} emptyMessage="No attendance recorded for this member." />}

      {tab === "Payments" && (
        <div className="space-y-2">
          {payments.length === 0 && <EmptyState title="No payments recorded for this member." />}
          {payments.map((p) => (
            <Card key={p.id} className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{p.fee_period}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  Paid {formatDate(p.paid_date)} &middot; {p.payment_method}
                </p>
              </div>
              <p className="text-sm font-semibold text-paid">{formatCurrency(p.amount)}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "Fee History" && (
        <div className="space-y-2">
          {payments.length === 0 && <EmptyState title="No fee history yet." />}
          {payments.map((p) => (
            <Card key={p.id} className="p-3.5 flex items-center justify-between">
              <p className="text-sm text-ink">
                {p.fee_period} &mdash; {formatCurrency(p.amount)} &mdash; Paid {formatDate(p.paid_date)}
              </p>
              <FeeStatusBadge status="Paid" />
            </Card>
          ))}
        </div>
      )}

      <MemberForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        editingMember={member}
        defaults={{ fee: settings?.default_monthly_fee ?? 1500, dueDay: settings?.default_due_day ?? 5 }}
      />
      <RecordPaymentModal open={payOpen} onClose={() => setPayOpen(false)} member={member} onSubmit={handlePayment} />
      <MarkEntryModal
        open={attendOpen}
        onClose={() => setAttendOpen(false)}
        members={[member]}
        onMark={handleMarkEntry}
      />
      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={handleMoveToLeft}
        title="Are you sure you want to remove this member?"
        message="This moves the member to 'Left Gym'. All payment and attendance history stays intact and viewable."
        confirmLabel="Move to Left Gym"
        loading={busy}
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Permanently delete this member?"
        message="This permanently deletes the member and all their attendance and payment history. This cannot be undone."
        confirmLabel="Delete Permanently"
        loading={busy}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
