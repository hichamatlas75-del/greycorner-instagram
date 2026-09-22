/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Configuration & Constantes Métier (js/config.js)
 * ==============================================================================
 */

const Config = {
  // Clés de stockage local pour la persistance des identifiants Supabase & du mode
  STORAGE_KEYS: {
    SUPABASE_URL: 'gc_insta_supabase_url',
    SUPABASE_KEY: 'gc_insta_supabase_key',
    DATA_STORE: 'gc_insta_posts_store_v1',
    APP_MODE: 'gc_insta_app_mode' // 'supabase' ou 'demo'
  },

  // Les 4 créneaux obligatoires fixes de chaque semaine
  WEEKLY_TEMPLATE: [
    {
      jour_cible: 'lundi',
      type: 'post',
      label: 'Lundi — Post Feed',
      defaultContent: 'produit',
      description: 'Plat vedette, nouveauté culinaire ou actualité du restaurant.',
      color: '#ff7043', // Accent Lundi Sunset Corail
      badgeClass: 'badge-lundi',
      tag: 'Post Feed'
    },
    {
      jour_cible: 'vendredi',
      type: 'story',
      label: 'Vendredi — Story',
      defaultContent: 'coulisses',
      description: 'Ambiance du soir, préparation du service, teasing du week-end.',
      color: '#f43f5e', // Accent Vendredi Rose Rubis
      badgeClass: 'badge-vendredi',
      tag: 'Story 24h'
    },
    {
      jour_cible: 'samedi',
      type: 'story',
      label: 'Samedi — Story',
      defaultContent: 'evenement',
      description: 'Coulisses, interactions clients, plat signature, événement.',
      color: '#f59e0b', // Accent Samedi Ambre Solaire
      badgeClass: 'badge-samedi',
      tag: 'Story 24h'
    },
    {
      jour_cible: 'dimanche',
      type: 'story',
      label: 'Dimanche — Story',
      defaultContent: 'promo',
      description: 'Récapitulatif de la semaine, ambiance brunch ou dernier service.',
      color: '#06b6d4', // Accent Dimanche Lagon Turquoise
      badgeClass: 'badge-dimanche',
      tag: 'Story 24h'
    }
  ],

  // Statuts autorisés
  STATUSES: {
    idee: { label: 'Idée', icon: '💡', class: 'status-idee' },
    planifie: { label: 'Planifié', icon: '📅', class: 'status-planifie' },
    publie: { label: 'Publié', icon: '✅', class: 'status-publie' }
  },

  // Types de contenus
  CONTENT_TYPES: {
    produit: { label: 'Produit / Plat', icon: '🍽️', color: '#ff7043' },
    coulisses: { label: 'Coulisses / Équipe', icon: '👨‍🍳', color: '#10b981' },
    promo: { label: 'Promo / Offre', icon: '🏷️', color: '#8b5cf6' },
    evenement: { label: 'Événement / Soirée', icon: '🎉', color: '#f59e0b' }
  }
};

window.Config = Config;
