-- Enforce employee identifier and normalized Sri Lankan phone uniqueness.
-- Preflight was clean: zero duplicate employee codes and zero duplicate E.164 phone groups.
create unique index if not exists users_employee_code_unique_idx
on public.users (upper(trim(agent_code)))
where nullif(trim(agent_code),'') is not null;

create unique index if not exists users_phone_e164_unique_idx
on public.users ((
  case
    when phone ~ '^0[0-9]{9}$' then '+94' || substr(phone,2)
    when phone ~ '^\+[1-9][0-9]{7,14}$' then phone
    else null
  end
))
where phone is not null and (
  phone ~ '^0[0-9]{9}$' or phone ~ '^\+[1-9][0-9]{7,14}$'
);
