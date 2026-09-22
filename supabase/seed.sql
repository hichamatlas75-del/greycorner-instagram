-- ==============================================================================
-- MODULE RÉSEAUX SOCIAUX — GREY CORNER
-- Données d'initialisation et d'exemple (Seed) sur 4 semaines (7 jours complets)
-- Semaines : 2026-W36, 2026-W37, 2026-W38, 2026-W39
-- ==============================================================================

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
