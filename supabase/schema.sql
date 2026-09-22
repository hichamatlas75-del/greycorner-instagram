-- ==============================================================================
-- MODULE RÉSEAUX SOCIAUX — GREY CORNER (INSTAGRAM UNIQUEMENT)
-- Schéma de base de données PostgreSQL pour Supabase
-- ==============================================================================

-- 1. EXTENSIONS REQUISES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CRÉATION DE LA TABLE POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('post', 'story')),
  jour_cible text not null check (jour_cible in ('lundi', 'vendredi', 'samedi', 'dimanche')),
  semaine text not null, -- Format ISO, ex: '2026-W39'
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

-- Commentaire sur la table
comment on table public.posts is 'Publications et stories Instagram hebdomadaires pour Grey Corner';

-- 3. INDEXATION POUR OPTIMISATION DES REQUÊTES
-- Index unique pour éviter les doublons sur un même créneau hebdomadaire
create unique index if not exists idx_posts_unique_slot 
  on public.posts (semaine, jour_cible, type);

-- Index pour les filtres par semaine et statut
create index if not exists idx_posts_semaine on public.posts (semaine);
create index if not exists idx_posts_statut on public.posts (statut);
create index if not exists idx_posts_type on public.posts (type);
create index if not exists idx_posts_type_contenu on public.posts (type_contenu);
create index if not exists idx_posts_date_reelle on public.posts (date_publication_reelle);

-- 4. TRIGGER POUR MISE À JOUR AUTOMATIQUE DU CHAMP UPDATED_AT
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

-- 5. SÉCURITÉ ROW LEVEL SECURITY (RLS)
alter table public.posts enable row level security;

-- Politique de lecture : autorisée pour tous (accès lecture depuis le Hub)
drop policy if exists "Lecture publique des publications" on public.posts;
create policy "Lecture publique des publications"
  on public.posts
  for select
  using (true);

-- Politique d'insertion : autorisée pour les utilisateurs authentifiés ou clé anon du Hub
drop policy if exists "Insertion autorisée pour le Hub" on public.posts;
create policy "Insertion autorisée pour le Hub"
  on public.posts
  for insert
  with check (true);

-- Politique de mise à jour : autorisée pour le Hub
drop policy if exists "Modification autorisée pour le Hub" on public.posts;
create policy "Modification autorisée pour le Hub"
  on public.posts
  for update
  using (true);

-- Politique de suppression : autorisée pour le Hub
drop policy if exists "Suppression autorisée pour le Hub" on public.posts;
create policy "Suppression autorisée pour le Hub"
  on public.posts
  for delete
  using (true);

-- 6. CONFIGURATION DU BUCKET SUPABASE STORAGE POUR LES VISUELS
insert into storage.buckets (id, name, public)
values ('instagram-media', 'instagram-media', true)
on conflict (id) do update set public = true;

-- Politiques de sécurité pour le Storage (Bucket public)
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
