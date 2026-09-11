"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import Card from "@/components/ui/Card";

const GYM_NAME = process.env.NEXT_PUBLIC_GYM_NAME || "DS FITNESS";

function toE164(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91${digits}`; // default to India
  return `+${digits}`;
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const e164 = toE164(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPhone(e164);
    setInfo(`OTP sent to ${e164}`);
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-steel px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl tracking-wide text-white font-semibold">{GYM_NAME}</p>
          <p className="text-white/60 text-sm mt-1">Fees Maintance &middot; Admin Login</p>
        </div>

        <Card className="p-6">
          {step === "phone" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <TextField
                label="Mobile Number"
                type="tel"
                required
                autoFocus
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                hint="We'll text a one-time code to this number."
              />
              {error && <p className="text-sm text-overdue">{error}</p>}
              <Button type="submit" fullWidth size="lg" disabled={loading || !phone}>
                {loading ? "Sending OTP\u2026" : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              {info && <p className="text-sm text-paid">{info}</p>}
              <TextField
                label="Enter OTP"
                type="text"
                inputMode="numeric"
                required
                autoFocus
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {error && <p className="text-sm text-overdue">{error}</p>}
              <Button type="submit" fullWidth size="lg" disabled={loading || otp.length < 4}>
                {loading ? "Verifying\u2026" : "Verify & Login"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError(null);
                }}
                className="w-full text-center text-sm text-ink-soft hover:text-ink"
              >
                Use a different number
              </button>
            </form>
          )}
        </Card>

        <p className="text-center text-white/40 text-xs mt-6">
          Access is restricted to authorised gym admins only.
        </p>
      </div>
    </main>
  );
}
