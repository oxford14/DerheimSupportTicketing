-- Add ticket source (where the support request originated)

do $$
begin
  -- Add column if missing
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tickets'
      and column_name = 'source'
  ) then
    alter table public.tickets
      add column source text not null default 'portal';
  end if;

  -- Add/replace constraint (idempotent)
  begin
    alter table public.tickets
      add constraint tickets_source_check
      check (source in ('portal', 'phone', 'email', 'whatsapp', 'other'));
  exception
    when duplicate_object then null;
  end;
end $$;

