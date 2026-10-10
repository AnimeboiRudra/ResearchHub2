-- Run in Supabase: SQL Editor > New query > paste > Run
create table team_emails(email text primary key, role text default 'member');
create table ideas(id uuid primary key default gen_random_uuid(), owner uuid default auth.uid(), owner_name text, title text not null, theme text, summary text, research text, neglect text, scores jsonb, why jsonb, risk text, created_at timestamptz default now());
create table sources(id uuid primary key default gen_random_uuid(), idea_id uuid references ideas on delete cascade, text text, url text, grade text, reason text, evidence jsonb);
create table files(id uuid primary key default gen_random_uuid(), idea_id uuid references ideas on delete cascade, path text, name text, type text);
create table comments(id uuid primary key default gen_random_uuid(), idea_id uuid references ideas on delete cascade, author_name text, text text, created_at timestamptz default now());
create table deadlines(id uuid primary key default gen_random_uuid(), title text, due date, owner_name text, done boolean default false);
create table settings(key text primary key, value jsonb);
create function is_member() returns boolean language sql security definer stable as $$ select exists(select 1 from team_emails where lower(email)=lower(auth.jwt()->>'email')) $$;
create function is_admin() returns boolean language sql security definer stable as $$ select exists(select 1 from team_emails where lower(email)=lower(auth.jwt()->>'email') and role='admin') $$;
alter table team_emails enable row level security; alter table ideas enable row level security; alter table sources enable row level security; alter table files enable row level security; alter table comments enable row level security; alter table deadlines enable row level security; alter table settings enable row level security;
create policy own_row on team_emails for select using (lower(email)=lower(auth.jwt()->>'email'));
create policy m_all on sources for all using (is_member()) with check (is_member());
create policy m_all on files for all using (is_member()) with check (is_member());
create policy m_all on comments for all using (is_member()) with check (is_member());
create policy m_all on deadlines for all using (is_member()) with check (is_member());
create policy m_read on settings for select using (is_member());
create policy a_write on settings for all using (is_admin()) with check (is_admin());
create policy i_read on ideas for select using (is_member());
create policy i_ins on ideas for insert with check (is_member());
create policy i_upd on ideas for update using (is_member());
create policy i_del on ideas for delete using (owner=auth.uid() or is_admin());
insert into storage.buckets(id,name,public) values('files','files',false);
create policy f_all on storage.objects for all using (bucket_id='files' and is_member()) with check (bucket_id='files' and is_member());
alter publication supabase_realtime add table ideas, sources, deadlines, settings;
-- Then add your 5 members (use their real Google emails):
-- insert into team_emails values ('you@gmail.com','admin'),('m2@gmail.com','member'),('m3@gmail.com','member'),('m4@gmail.com','member'),('m5@gmail.com','member');
