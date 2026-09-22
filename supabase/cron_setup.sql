-- ==============================================================================
-- MODULE RÉSEAUX SOCIAUX — GREY CORNER
-- Configuration de la planification automatique avec pg_cron
-- Rappel le soir même pour relever les vues des stories avant expiration 24h
-- ==============================================================================

-- 1. ACTIVATION DES EXTENSIONS NÉCESSAIRES
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. CRÉATION D'UNE TABLE D'AUDIT POUR LES RAPPELS D'EXPIRATION
create table if not exists public.story_reminders_log (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  date_alerte timestamptz default now(),
  statut_envoi text default 'alerte_emise',
  message text,
  created_at timestamptz default now()
);

-- 3. FONCTION DE VÉRIFICATION ET DÉCLENCHEMENT DE L'ALERTE
-- Cette fonction détecte les stories du jour publiées dont les vues n'ont pas encore été relevées
create or replace function public.check_stories_view_reminder()
returns void as $$
declare
  r record;
  today_day_fr text;
begin
  -- Déterminer le jour actuel en français
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

  -- Si aujourd'hui est un jour valide
  if today_day_fr <> '' then
    for r in 
      select id, semaine, jour_cible, titre, vues, statut
      from public.posts
      where type = 'story'
        and jour_cible = today_day_fr
        and statut = 'publie'
        and (vues is null or vues = 0)
    loop
      -- Enregistrer l'alerte dans le journal
      insert into public.story_reminders_log (post_id, message)
      values (
        r.id, 
        format('⚠️ RAPPEL 24H: La story du %s (semaine %s) expire bientôt ! Veuillez relever le nombre de vues.', r.jour_cible, r.semaine)
      );
    end loop;
  end if;
end;
$$ language plpgsql security definer;

-- 4. PROGRAMMATION AVEC PG_CRON
-- Déclenchement à 21h30 tous les soirs (1 à 7)
-- Cron syntax: minute (30) heure (21) jour-du-mois (*) mois (*) jour-de-la-semaine (*)
select cron.schedule(
  'rappel-expiration-stories-greycorner',
  '30 21 * * *',
  $$select public.check_stories_view_reminder();$$
);

-- Optionnel : Appel direct de l'Edge Function via pg_net (à adapter avec votre URL de projet)
-- select cron.schedule(
--   'rappel-edge-function',
--   '30 21 * * 5,6,0',
--   $$
--   select net.http_post(
--     url := 'https://[VOTRE-PROJET-SUPABASE].functions.supabase.co/reminder-story-expiration',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer [VOTRE-ANON-KEY]"}'::jsonb,
--     body := '{"source": "pg_cron"}'::jsonb
--   );
--   $$
-- );
