# Module Réseaux Sociaux — Grey Corner (Instagram)

Module de planification, de publication et de suivi analytique Instagram pour le **Hub Grey Corner**.

Conçu spécialement selon les spécifications :
- **Réseau unique** : Instagram (Post feed le lundi, Stories les vendredis, samedis et dimanches).
- **Rythme fixe de 4 créneaux/semaine** avec template automatique pour éviter la page blanche.
- **Rappel d'expiration 24h** pour les stories afin de relever les vues avant disparition.
- **Dashboard d'engagement** : Taux de respect du rythme, moyenne des vues stories vs post du lundi, meilleur jour sur 4 semaines et classement par typologie de contenu.
- **Architecture sans framework lourd** (Vanilla HTML5 / CSS3 / ES6) déployable directement sur **Cloudflare Pages**.
- **Backend Supabase** : PostgreSQL + Storage pour les visuels + Edge Function de rappel avec `pg_cron`.

---

## 📁 Structure du Projet

```
PUBLICATION INSTAGRAM PROGRAMMER/
├── prompt_module_reseaux_sociaux.png      # Spécification graphique originale
├── index.html                              # Application Web monopage (SPA)
├── css/
│   └── style.css                           # Charte graphique Grey Corner (Atelier écru, laiton)
├── js/
│   ├── config.js                           # Constantes, créneaux types et templates
│   ├── date-utils.js                       # Gestion des semaines ISO 8601 & calendrier
│   ├── supabase-client.js                  # Service de données unifié (Supabase + Démo)
│   ├── calendar.js                         # Rendu et pré-remplissage du calendrier hebdomadaire
│   ├── dashboard.js                        # Calcul des 4 indicateurs clés (KPIs)
│   └── app.js                              # Contrôleur général, modales et téléversement
├── supabase/
│   ├── schema.sql                          # Schéma SQL complet (table posts, RLS, Storage)
│   ├── seed.sql                            # Données d'exemple réalistes sur 4 semaines
│   ├── cron_setup.sql                      # Planification pg_cron du rappel 24h
│   └── functions/
│       └── reminder-story-expiration/
│           └── index.ts                    # Edge Function Deno pour alerter avant expiration
└── README.md                               # Cette documentation
```

---

## 🚀 Prise en main Rapide (Mode Démo Local)

L'application est immédiatement testable en ouvrant `index.html` dans votre navigateur (ou via un serveur local).

1. Ouvrez `index.html`.
2. Le **Mode Démo Local** s'active automatiquement avec des données d'exemple sur 4 semaines.
3. Vous pouvez :
   - Naviguer entre les semaines avec les flèches `←` et `→`.
   - Tester le **pré-remplissage automatique** des 4 créneaux.
   - Changer les statuts (`Idée` ➔ `Planifié` ➔ `Publié`).
   - Glisser-déposer des visuels et renseigner les métriques.
   - Consulter le dashboard en temps réel.

---

## 🗄️ Configuration avec Supabase

Pour basculer vers votre base de données Supabase en production :

### Étape 1 : Créer la table et le stockage
1. Rendez-vous dans votre projet Supabase : [https://supabase.com](https://supabase.com).
2. Ouvrez le **SQL Editor** et exécutez le contenu du fichier `supabase/schema.sql`.
   - Cela crée la table `posts`, les index, les politiques RLS et le bucket public `instagram-media`.
3. *(Optionnel)* Pour charger les données d'historique de démonstration, exécutez `supabase/seed.sql`.

### Étape 2 : Connecter l'application
1. Dans l'application web, cliquez sur l'icône **⚙️ (Paramètres)** en haut à droite.
2. Saisissez votre **Project URL** et votre **Anon Public Key** (trouvables dans *Settings > API* sur Supabase).
3. Cliquez sur **Enregistrer la connexion**.
4. Le badge passe au vert : **Supabase Connecté**.

---

## ⏰ Configuration du Rappel 24h (Stories)

Les stories Instagram disparaissent au bout de 24h. Pour recevoir une notification le soir même :

### 1. Déploiement de l'Edge Function
Avec le CLI Supabase :
```bash
supabase functions deploy reminder-story-expiration
```
*(Optionnel)* Définissez un webhook de notification (ex: webhook Telegram ou Discord) :
```bash
supabase secrets set NOTIFICATION_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### 2. Activation de `pg_cron`
Dans l'éditeur SQL de Supabase, exécutez `supabase/cron_setup.sql`. La fonction s'exécutera automatiquement chaque vendredi, samedi et dimanche soir à **21h30**.

---

## 🌐 Déploiement sur Cloudflare Pages

1. Créez un dépôt Git ou connectez votre dossier à GitHub / GitLab.
2. Dans le tableau de bord Cloudflare :
   - Allez dans **Workers & Pages** > **Create application** > **Pages**.
   - Sélectionnez votre dépôt.
   - Laissez la configuration de build par défaut :
     - **Framework preset** : None
     - **Build output directory** : `/` (racine)
3. Cliquez sur **Save and Deploy**. Votre application est en ligne sous une URL type `https://greycorner-insta.pages.dev`.

### Intégration dans le Hub Grey Corner
Ajoutez une tuile dans le fichier `index.html` de votre Hub principal (`hicham-hub`) :
```html
<a class="tile" data-cat="Business" data-name="Instagram Grey Corner" href="https://greycorner-insta.pages.dev/" target="_blank" rel="noopener">
  <div class="tile-top">
    <div class="icon">📸</div>
    <span class="status">En ligne</span>
  </div>
  <div class="tile-body">
    <span class="tag">Business</span>
    <h2>Réseaux Sociaux</h2>
    <p>Planification des stories & posts Instagram, calendrier hebdo et suivi de l'engagement.</p>
  </div>
  <div class="tile-foot">
    <span class="url">greycorner-insta.pages.dev</span>
    <span class="open">Ouvrir <span class="arrow">→</span></span>
  </div>
</a>
```
