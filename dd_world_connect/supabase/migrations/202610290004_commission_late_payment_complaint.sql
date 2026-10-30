alter table public.commission_complaints drop constraint if exists commission_complaints_complaint_type_check;
alter table public.commission_complaints add constraint commission_complaints_complaint_type_check
 check (complaint_type = any (array['not_received'::text,'wrong_amount'::text,'late_payment'::text,'other'::text]));
