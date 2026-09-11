"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Payment } from "@/lib/types";
import { computeNextDueDate } from "@/lib/feeLogic";

export type PaymentWithMember = Payment & {
  members: { full_name: string; member_code: string; mobile_number: string } | null;
};

export function usePayments(memberId?: string) {
  const supabase = createClient();
  const [payments, setPayments] = useState<PaymentWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("payments")
      .select("*, members(full_name, member_code, mobile_number)")
      .order("paid_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (memberId) query = query.eq("member_id", memberId);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setPayments(data as PaymentWithMember[]);
    setLoading(false);
  }, [supabase, memberId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Records a payment AND rolls the member's fee_due_date forward to the
   * next cycle, so they immediately drop out of due/overdue reminders.
   */
  const recordPayment = useCallback(
    async (params: {
      member_id: string;
      fee_period: string;
      amount: number;
      due_date: string;
      paid_date: string;
      payment_method: Payment["payment_method"];
      reference_note?: string;
      membership_duration_months: number;
    }) => {
      const { membership_duration_months, ...paymentInput } = params;

      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert(paymentInput)
        .select("*, members(full_name, member_code, mobile_number)")
        .single();
      if (payErr) throw new Error(payErr.message);

      const nextDue = computeNextDueDate(params.due_date, membership_duration_months);
      const { error: memberErr } = await supabase
        .from("members")
        .update({ fee_due_date: nextDue, status: "Active" })
        .eq("id", params.member_id);
      if (memberErr) throw new Error(memberErr.message);

      setPayments((prev) => [payment as PaymentWithMember, ...prev]);
      return { payment: payment as PaymentWithMember, nextDueDate: nextDue };
    },
    [supabase]
  );

  return { payments, loading, error, refresh, recordPayment };
}
