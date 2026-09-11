import { formatCurrency, formatDate } from "./feeLogic";

/**
 * Builds a wa.me deep link with a pre-filled reminder message.
 * Opening this link requires an explicit admin click -- nothing is sent automatically.
 */
export function buildWhatsAppReminderUrl(params: {
  gymName: string;
  memberName: string;
  mobileNumber: string;
  amount: number;
  dueDateIso: string;
  currency?: string;
}): string {
  const { gymName, memberName, mobileNumber, amount, dueDateIso, currency = "INR" } = params;
  const firstName = memberName.split(" ")[0];
  const message =
    `Hello ${firstName}, this is a reminder from ${gymName} that your gym fee of ` +
    `${formatCurrency(amount, currency)} is due on ${formatDate(dueDateIso)}. ` +
    `Please make the payment at your convenience. Thank you.`;

  const digits = mobileNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
