-- Accounts are invite-only: a new account can only be made for an email
-- with a pending herd invite. People who already have an account sign in as
-- usual. The very first account on a new project is let through, so there's
-- someone to send invites. Called by Supabase Auth before it creates a user
-- (supabase/config.toml [auth.hook.before_user_created]; on a hosted project,
-- Authentication → Hooks).

create function public.before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  new_email text := lower(trim(event -> 'user' ->> 'email'));
begin
  if not exists (select 1 from auth.users)
    or exists (select 1 from public.herd_invites i where i.email = new_email) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'This email hasn''t been invited. Ask a herd owner to invite you, then sign in with the same email.'
  ));
end;
$$;

grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.before_user_created(jsonb) from authenticated, anon, public;
