-- Create in-app alerts for commission, report, meeting and complaint lifecycle events.
create or replace function public.dd_comm_notify_event()
returns trigger language plpgsql security definer set search_path=public,pg_temp
as $fn$
declare target uuid; body_text text; event_title text; event_type text; event_data jsonb;
begin
 if tg_table_name='commissions' then
  target:=new.employee_id; event_title:='New commission'; event_type:='new_commission';
  body_text:='A commission record was added for period '||new.period_month::text||'.';
  event_data:=jsonb_build_object('commission_id',new.id);
  insert into public.notifications(user_id,title,body,type,page,data) values(target,event_title,body_text,event_type,'commissions',event_data);
 elsif tg_table_name='dialog_reports' then
  event_title:='New Dialog report';event_type:='new_report';
  body_text:='A new '||new.report_type||' Dialog report is available: '||new.title;
  event_data:=jsonb_build_object('report_id',new.id,'report_type',new.report_type);
  insert into public.notifications(user_id,title,body,type,page,data)
  select u.id,event_title,body_text,event_type,'dialog_reports',event_data from public.users u
  where u.status='active' and u.employment_status='ACTIVE' and u.id_approval_status='APPROVED';
 elsif tg_table_name='commission_complaints' then
  if old.status is distinct from new.status or old.owner_response is distinct from new.owner_response then
   target:=new.employee_id;event_title:='Commission complaint updated';event_type:='complaint_update';
   body_text:='Your commission complaint status is now '||new.status||'.';
   event_data:=jsonb_build_object('complaint_id',new.id,'status',new.status);
   insert into public.notifications(user_id,title,body,type,page,data) values(target,event_title,body_text,event_type,'commission_complaints',event_data);
  end if;
 elsif tg_table_name='meetings' then
  event_title:='New meeting scheduled';event_type:='meeting_reminder';
  body_text:='A meeting has been scheduled: '||new.title;
  event_data:=jsonb_build_object('meeting_id',new.id,'starts_at',new.starts_at);
  insert into public.notifications(user_id,title,body,type,page,data)
  select u.id,event_title,body_text,event_type,'meetings',event_data from public.users u
  where u.status='active' and u.employment_status='ACTIVE' and u.id_approval_status='APPROVED'
   and (new.team_id is null or u.team_id=new.team_id);
 end if;
 return new;
end
$fn$;
revoke all on function public.dd_comm_notify_event() from public;

drop trigger if exists commission_notification_created on public.commissions;
create trigger commission_notification_created after insert on public.commissions for each row execute function public.dd_comm_notify_event();
drop trigger if exists dialog_report_notification_created on public.dialog_reports;
create trigger dialog_report_notification_created after insert on public.dialog_reports for each row execute function public.dd_comm_notify_event();
drop trigger if exists complaint_notification_updated on public.commission_complaints;
create trigger complaint_notification_updated after update on public.commission_complaints for each row execute function public.dd_comm_notify_event();
drop trigger if exists meeting_notification_created on public.meetings;
create trigger meeting_notification_created after insert on public.meetings for each row execute function public.dd_comm_notify_event();
