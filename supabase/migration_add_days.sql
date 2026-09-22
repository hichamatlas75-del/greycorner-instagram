-- ==============================================================================
-- MODULE RÉSEAUX SOCIAUX — GREY CORNER (INSTAGRAM)
-- Migration SQL : Extension du calendrier à 7 jours (Mardi, Mercredi, Jeudi)
-- ==============================================================================
-- À exécuter dans le SQL Editor de votre tableau de bord Supabase :
-- https://supabase.com/dashboard/project/asbjvbyaohueievfabwz/sql

-- 1. Suppression de l'ancienne contrainte limitant aux 4 jours
alter table public.posts drop constraint if exists posts_jour_cible_check;

-- 2. Ajout de la nouvelle contrainte autorisant les 7 jours de la semaine
alter table public.posts add constraint posts_jour_cible_check 
  check (jour_cible in ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'));

-- 3. Mise à jour de la fonction de rappel 24H pour vérifier tous les jours
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

-- 4. Reprogrammation du cron pour tourner tous les soirs à 21h30
select cron.unschedule('rappel-expiration-stories-greycorner');

select cron.schedule(
  'rappel-expiration-stories-greycorner',
  '30 21 * * *',
  $$select public.check_stories_view_reminder();$$
);
