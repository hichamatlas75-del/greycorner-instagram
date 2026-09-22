-- ==============================================================================
-- MODULE RÉSEAUX SOCIAUX — GREY CORNER (INSTAGRAM)
-- SCRIPT DE MISE À JOUR SQL COMPLÈTE (TOUT-EN-UN)
-- ==============================================================================
-- Ce script est idempotent (peut être exécuté plusieurs fois sans erreur).
-- Il met à jour les tables, contraintes (7 jours), bucket de stockage,
-- politiques de sécurité RLS, cron de rappel 24h et données de démo.
--
-- Exécutez-le dans le SQL Editor de Supabase :
-- https://supabase.com/dashboard/project/asbjvbyaohueievfabwz/sql
-- ==============================================================================

-- 1. EXTENSIONS REQUISES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. TABLE DES PUBLICATIONS (POSTS & STORIES)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('post', 'story')),
  jour_cible text not null,
  semaine text not null,
  statut text not null default 'idee' check (statut in ('idee', 'planifie', 'publie')),
  type_contenu text check (type_contenu in ('produit', 'coulisses', 'promo', 'evenement')),
  visuel_url text,
  titre text,
  legende text,
  date_publication_reelle timestamptz,
  vues integer default 0,
  likes integer default 0,
  commentaires integer default 0,
  partages integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Déblocage de la contrainte pour autoriser les 7 jours de la semaine
alter table public.posts drop constraint if exists posts_jour_cible_check;

alter table public.posts add constraint posts_jour_cible_check 
  check (jour_cible in ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'));

-- Index unique par créneau et semaine
create unique index if not exists idx_posts_unique_slot 
  on public.posts (semaine, jour_cible, type);

create index if not exists idx_posts_semaine on public.posts (semaine);
create index if not exists idx_posts_statut on public.posts (statut);
create index if not exists idx_posts_type on public.posts (type);

-- Trigger updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_updated_at on public.posts;
create trigger trigger_set_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

-- RLS sur public.posts
alter table public.posts enable row level security;

drop policy if exists "Lecture publique des publications" on public.posts;
create policy "Lecture publique des publications"
  on public.posts for select using (true);

drop policy if exists "Insertion autorisée pour le Hub" on public.posts;
create policy "Insertion autorisée pour le Hub"
  on public.posts for insert with check (true);

drop policy if exists "Modification autorisée pour le Hub" on public.posts;
create policy "Modification autorisée pour le Hub"
  on public.posts for update using (true);

drop policy if exists "Suppression autorisée pour le Hub" on public.posts;
create policy "Suppression autorisée pour le Hub"
  on public.posts for delete using (true);


-- 3. STORAGE SUPABASE (BUCKET INSTAGRAM-MEDIA)
insert into storage.buckets (id, name, public)
values ('instagram-media', 'instagram-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Accès public en lecture aux médias Instagram" on storage.objects;
create policy "Accès public en lecture aux médias Instagram"
  on storage.objects for select
  using (bucket_id = 'instagram-media');

drop policy if exists "Upload de médias Instagram autorisé" on storage.objects;
create policy "Upload de médias Instagram autorisé"
  on storage.objects for insert
  with check (bucket_id = 'instagram-media');

drop policy if exists "Modification de médias Instagram autorisée" on storage.objects;
create policy "Modification de médias Instagram autorisée"
  on storage.objects for update
  using (bucket_id = 'instagram-media');

drop policy if exists "Suppression de médias Instagram autorisée" on storage.objects;
create policy "Suppression de médias Instagram autorisée"
  on storage.objects for delete
  using (bucket_id = 'instagram-media');


-- 4. BANQUE DE VISUELS (MÉDIATHÈQUE / STOCK DE PHOTOS)
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  titre text,
  type_contenu text default 'produit' check (type_contenu in ('produit', 'coulisses', 'promo', 'evenement')),
  statut text not null default 'disponible' check (statut in ('disponible', 'planifie', 'publie')),
  post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.media_library enable row level security;

drop policy if exists "Lecture publique de la banque de visuels" on public.media_library;
create policy "Lecture publique de la banque de visuels"
  on public.media_library for select using (true);

drop policy if exists "Insertion dans la banque de visuels autorisée" on public.media_library;
create policy "Insertion dans la banque de visuels autorisée"
  on public.media_library for insert with check (true);

drop policy if exists "Modification de la banque de visuels autorisée" on public.media_library;
create policy "Modification de la banque de visuels autorisée"
  on public.media_library for update using (true);

drop policy if exists "Suppression de la banque de visuels autorisée" on public.media_library;
create policy "Suppression de la banque de visuels autorisée"
  on public.media_library for delete using (true);


-- 5. JOURNAL DES RAPPELS D'EXPIRATION DES STORIES (24H)
create table if not exists public.story_reminders_log (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  sent_at timestamptz default now(),
  message text,
  statut text default 'envoye'
);

alter table public.story_reminders_log enable row level security;

drop policy if exists "Accès en lecture aux rappels" on public.story_reminders_log;
create policy "Accès en lecture aux rappels"
  on public.story_reminders_log for select using (true);

drop policy if exists "Insertion de rappels" on public.story_reminders_log;
create policy "Insertion de rappels"
  on public.story_reminders_log for insert with check (true);


-- 6. FONCTION DE VÉRIFICATION AUTOMATIQUE DES STORIES (7 JOURS)
create or replace function public.check_stories_view_reminder()
returns void as $$
declare
  r record;
  today_day_fr text;
begin
  select case extract(isodow from now())
    when 1 then 'lundi'
    when 2 then 'mardi'
    when 3 then 'mercredi'
    when 4 then 'jeudi'
    when 5 then 'vendredi'
    when 6 then 'samedi'
    when 7 then 'dimanche'
    else ''
  end into today_day_fr;

  if today_day_fr <> '' then
    for r in 
      select id, semaine, jour_cible, titre, vues, statut
      from public.posts
      where type = 'story'
        and jour_cible = today_day_fr
        and statut = 'publie'
        and (vues is null or vues = 0)
    loop
      insert into public.story_reminders_log (post_id, message)
      values (
        r.id, 
        format('⚠️ RAPPEL 24H: La story du %s (semaine %s) expire bientôt ! Veuillez relever le nombre de vues.', r.jour_cible, r.semaine)
      );
    end loop;
  end if;
end;
$$ language plpgsql security definer;


-- 7. PROGRAMMATION CRON (EXÉCUTION CHAQUE SOIR À 21H30)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('rappel-expiration-stories-greycorner');
    perform cron.schedule(
      'rappel-expiration-stories-greycorner',
      '30 21 * * *',
      'select public.check_stories_view_reminder();'
    );
  end if;
exception when others then
  -- Ignore si pg_cron n'est pas activé dans le projet Supabase
  null;
end;
$$;


-- 8. DONNÉES D'EXEMPLE SUR 4 SEMAINES (7 JOURS COMPLETS)
-- Semaine 2026-W36
insert into public.posts (type, jour_cible, semaine, statut, type_contenu, visuel_url, date_publication_reelle, vues, likes, commentaires, partages)
values 
  ('post', 'lundi', '2026-W36', 'publie', 'produit', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', '2026-08-31 11:30:00+00', 1240, 248, 26, 14),
  ('story', 'mardi', '2026-W36', 'publie', 'produit', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', '2026-09-01 10:00:00+00', 780, 38, 4, 6),
  ('story', 'mercredi', '2026-W36', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', '2026-09-02 11:15:00+00', 850, 45, 7, 9),
  ('story', 'jeudi', '2026-W36', 'publie', 'evenement', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', '2026-09-03 18:30:00+00', 990, 56, 9, 14),
  ('story', 'vendredi', '2026-W36', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', '2026-09-04 18:00:00+00', 820, 42, 5, 8),
  ('story', 'samedi', '2026-W36', 'publie', 'evenement', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', '2026-09-05 19:15:00+00', 1050, 68, 12, 19),
  ('story', 'dimanche', '2026-W36', 'publie', 'promo', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', '2026-09-06 10:45:00+00', 740, 31, 3, 4)
on conflict (semaine, jour_cible, type) do nothing;

-- Semaine 2026-W37
insert into public.posts (type, jour_cible, semaine, statut, type_contenu, visuel_url, date_publication_reelle, vues, likes, commentaires, partages)
values 
  ('post', 'lundi', '2026-W37', 'publie', 'produit', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', '2026-09-07 12:00:00+00', 1410, 312, 38, 22),
  ('story', 'mardi', '2026-W37', 'publie', 'produit', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', '2026-09-08 10:30:00+00', 920, 51, 6, 10),
  ('story', 'mercredi', '2026-W37', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', '2026-09-09 11:45:00+00', 890, 47, 5, 8),
  ('story', 'jeudi', '2026-W37', 'publie', 'evenement', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', '2026-09-10 19:00:00+00', 1100, 72, 11, 16),
  ('story', 'vendredi', '2026-W37', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', '2026-09-11 18:30:00+00', 910, 54, 8, 11),
  ('story', 'samedi', '2026-W37', 'publie', 'evenement', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', '2026-09-12 20:00:00+00', 1230, 95, 18, 27),
  ('story', 'dimanche', '2026-W37', 'publie', 'produit', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', '2026-09-13 11:00:00+00', 880, 47, 4, 7)
on conflict (semaine, jour_cible, type) do nothing;

-- Semaine 2026-W38
insert into public.posts (type, jour_cible, semaine, statut, type_contenu, visuel_url, date_publication_reelle, vues, likes, commentaires, partages)
values 
  ('post', 'lundi', '2026-W38', 'publie', 'promo', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', '2026-09-14 11:45:00+00', 1180, 215, 19, 15),
  ('story', 'mardi', '2026-W38', 'publie', 'produit', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', '2026-09-15 10:00:00+00', 810, 41, 4, 7),
  ('story', 'mercredi', '2026-W38', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', '2026-09-16 11:30:00+00', 870, 44, 5, 8),
  ('story', 'jeudi', '2026-W38', 'publie', 'evenement', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', '2026-09-17 18:45:00+00', 1040, 67, 10, 15),
  ('story', 'vendredi', '2026-W38', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=80', '2026-09-18 19:00:00+00', 870, 48, 6, 9),
  ('story', 'samedi', '2026-W38', 'publie', 'evenement', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', '2026-09-19 20:30:00+00', 1190, 89, 14, 21),
  ('story', 'dimanche', '2026-W38', 'publie', 'coulisses', 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?auto=format&fit=crop&w=800&q=80', '2026-09-20 11:15:00+00', 810, 39, 2, 5)
on conflict (semaine, jour_cible, type) do nothing;

-- Semaine 2026-W39 (Semaine courante)
insert into public.posts (type, jour_cible, semaine, statut, type_contenu, visuel_url, date_publication_reelle, vues, likes, commentaires, partages)
values 
  ('post', 'lundi', '2026-W39', 'publie', 'produit', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', '2026-09-21 11:00:00+00', 1350, 290, 34, 18),
  ('story', 'mardi', '2026-W39', 'planifie', 'produit', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', null, 0, 0, 0, 0),
  ('story', 'mercredi', '2026-W39', 'planifie', 'coulisses', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', null, 0, 0, 0, 0),
  ('story', 'jeudi', '2026-W39', 'planifie', 'evenement', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', null, 0, 0, 0, 0),
  ('story', 'vendredi', '2026-W39', 'planifie', 'coulisses', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', null, 0, 0, 0, 0),
  ('story', 'samedi', '2026-W39', 'idee', 'evenement', null, null, 0, 0, 0, 0),
  ('story', 'dimanche', '2026-W39', 'idee', 'promo', null, null, 0, 0, 0, 0)
on conflict (semaine, jour_cible, type) do nothing;
