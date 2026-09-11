export type MemberStatus = "Active" | "Expired" | "Left Gym";
export type PaymentMethod = "Cash" | "UPI" | "Card" | "Bank Transfer" | "Other";
export type FeeStatus = "Paid" | "Due Soon" | "Overdue" | "Due Later";

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  gender: "Male" | "Female" | "Other" | null;
  date_of_birth: string | null;
  joining_date: string;
  membership_plan: string;
  membership_duration_months: number;
  monthly_fee: number;
  fee_due_date: string;
  emergency_contact: string | null;
  address: string | null;
  status: MemberStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  entry_date: string;
  entry_time: string;
  created_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  fee_period: string;
  amount: number;
  due_date: string;
  paid_date: string;
  payment_method: PaymentMethod;
  reference_note: string | null;
  created_at: string;
}

export interface Settings {
  id: number;
  gym_name: string;
  admin_name: string;
  currency: string;
  default_monthly_fee: number;
  default_due_day: number;
  reminder_days_before: number;
  updated_at: string;
}
