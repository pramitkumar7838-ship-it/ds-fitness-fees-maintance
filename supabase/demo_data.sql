-- ============================================================
-- OPTIONAL DEMO DATA -- clearly labelled, safe to skip.
-- Run this only in a development project, never in production.
-- Requires schema.sql and at least one row in `admins` to already exist.
-- ============================================================

insert into members (full_name, mobile_number, gender, joining_date, membership_plan, monthly_fee, fee_due_date, status)
values
  ('Rahul Sharma (DEMO)', '+919810000001', 'Male', current_date - interval '40 days', 'Standard', 1500, current_date + interval '2 days', 'Active'),
  ('Aman Kumar (DEMO)', '+919810000002', 'Male', current_date - interval '20 days', 'Premium', 2000, current_date + interval '5 days', 'Active'),
  ('Priya Verma (DEMO)', '+919810000003', 'Female', current_date - interval '70 days', 'Standard', 1500, current_date - interval '3 days', 'Active'),
  ('Vikas Yadav (DEMO)', '+919810000004', 'Male', current_date - interval '10 days', 'Standard', 1500, current_date - interval '1 days', 'Active')
on conflict do nothing;

-- A couple of past payments and today's attendance for the demo members
insert into payments (member_id, fee_period, amount, due_date, paid_date, payment_method)
select id, to_char(current_date, 'YYYY-MM'), monthly_fee, fee_due_date, current_date - interval '5 days', 'UPI'
from members where full_name like '%(DEMO)%' limit 2;

insert into attendance (member_id, entry_date, entry_time)
select id, current_date, (current_time - interval '2 hours')
from members where full_name like '%(DEMO)%';
