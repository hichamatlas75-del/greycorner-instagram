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
    MEDIA_STORE: 'gc_insta_media_store_v1',
    APP_MODE: 'gc_insta_app_mode' // 'supabase' ou 'demo'
  },

  // Identifiants Supabase par défaut (connectés au projet officiel Grey Corner)
  DEFAULT_SUPABASE_URL: 'https://asbjvbyaohueievfabwz.supabase.co',
  DEFAULT_SUPABASE_KEY: 'sb_publishable_V8RHogWWqbKdlDPbOXA7ow_iFQknQTD',

  // Les 7 créneaux hebdomadaires complets (Lundi au Dimanche)
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
      jour_cible: 'mardi',
      type: 'story',
      label: 'Mardi — Story',
      defaultContent: 'produit',
      description: 'Arrivages frais du marché, produits de saison & carte des vins.',
      color: '#10b981', // Accent Mardi Émeraude Fraîcheur
      badgeClass: 'badge-mardi',
      tag: 'Story 24h'
    },
    {
      jour_cible: 'mercredi',
      type: 'story',
      label: 'Mercredi — Story',
      defaultContent: 'coulisses',
      description: 'En cuisine avec la brigade, secret du chef ou préparation minute.',
      color: '#8b5cf6', // Accent Mercredi Violet Savoir-faire
      badgeClass: 'badge-mercredi',
      tag: 'Story 24h'
    },
    {
      jour_cible: 'jeudi',
      type: 'story',
      label: 'Jeudi — Story',
      defaultContent: 'evenement',
      description: 'Afterwork, cocktails signatures, suggestions du dîner & ambiance festive.',
      color: '#ec4899', // Accent Jeudi Rose Fuchsia
      badgeClass: 'badge-jeudi',
      tag: 'Story 24h'
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
  },

  // ─── RECOMMANDATIONS DE FORMATS INSTAGRAM ───
  FORMAT_RECOMMENDATIONS: {
    story: {
      type: 'story',
      ratio: '9:16 Vertical',
      dimensions: '1080 × 1920 px',
      badgeLabel: 'Story 9:16 Vertical',
      icon: '📱',
      color: '#f43f5e',
      aspectRatio: '9 / 16',
      conseil: 'Format vertical plein écran (1080×1920). Laissez 15% d\'espace en haut et en bas pour que les boutons Instagram ne cachent pas votre plat.'
    },
    post: {
      type: 'post',
      ratio: '4:5 Vertical (Recommandé) ou 1:1 Carré',
      dimensions: '1080 × 1350 px (4:5) ou 1080 × 1080 px (1:1)',
      badgeLabel: 'Post Feed 4:5 ou 1:1',
      icon: '🖼️',
      color: '#ff7043',
      aspectRatio: '4 / 5',
      conseil: 'Le format 4:5 vertical (1080×1350) prend 25% d\'espace en plus sur le fil Instagram qu\'une photo carrée, augmentant significativement les clics et likes !'
    }
  },

  // ─── MODÈLES DE LÉGENDES PROFESSIONNELLES POUR RESTAURANT ───
  CAPTION_TEMPLATES: [
    {
      id: 'plat-vedette',
      type: 'produit',
      label: '🍽️ Plat Vedette / Nouveau Plat',
      titleSuggestion: 'Notre nouvelle création à la carte',
      caption: `Une explosion de saveurs au Grey Corner ✨\n\nNotre Chef vous présente notre nouveau plat à la carte : des ingrédients frais de saison, une cuisson maîtrisée et une passion intacte dans chaque assiette.\n\n📍 Grey Corner — Votre table vous attend.\n📞 Réservations au déjeuner & au dîner en lien dans la bio.\n\n#GreyCorner #RestaurantFes #FoodLovers #FesFood #Gastronomie #FoodPorn`
    },
    {
      id: 'viande-braise',
      type: 'produit',
      label: '🥩 Viandes d\'Exception & Braise',
      titleSuggestion: 'Pièce de viande grillée à la braise',
      caption: `Quand la flamme sublime les meilleures pièces... 🔥\n\nDécouvrez notre sélection de viandes tendres et savoureuses, saisies à la perfection pour les véritables amateurs de bonne cuisine.\n\n👉 Venez goûter la différence ce midi ou ce soir au Grey Corner !\n\n#MeatLovers #Grillade #GreyCorner #RestaurantFes #Foodies #BonneTable #Fes`
    },
    {
      id: 'vendredi-teasing',
      type: 'coulisses',
      label: '🍸 Ambiance Vendredi Soir & Cocktails',
      titleSuggestion: 'Ambiance du vendredi & cocktails',
      caption: `Le week-end commence maintenant au Grey Corner 🍸✨\n\nLumières tamisées, musique d'ambiance et cocktails signature : l'atmosphère parfaite pour déconnecter de votre semaine et passer un moment inoubliable.\n\n🎉 On se retrouve dès 19h30 ! Pensez à réserver votre table.\n\n#FridayNight #GreyCorner #WeekendVibes #Cocktails #RestaurantFes #NightLife`
    },
    {
      id: 'samedi-soiree',
      type: 'evenement',
      label: '🎉 Soirée Samedi & Convivialité',
      titleSuggestion: 'Soirée du samedi au Grey Corner',
      caption: `Une énergie magnifique ce samedi soir au Grey Corner ! 🌟\n\nMerci à toutes et à tous pour votre fidélité et vos sourires. Nos équipes en salle et en cuisine donnent le meilleur pour vous régaler.\n\n🥂 Passez un excellent week-end à nos côtés !\n\n#GreyCorner #SamediSoir #Ambiance #Fes #RestaurantFes #Partage #FesDining`
    },
    {
      id: 'dimanche-brunch',
      type: 'promo',
      label: '🥞 Formule Brunch & Douceurs Dimanche',
      titleSuggestion: 'Brunch gourmand du dimanche',
      caption: `Le rituel sacré du dimanche : le Brunch Grey Corner ☕🥞\n\nPancakes moelleux, douceurs sucrées, assiettes salées gourmandes et jus frais pressés minute. Prenez le temps de savourer en famille ou entre amis jusqu'à 16h.\n\n✨ Venez bruncher en toute décontraction !\n\n#BrunchFes #DimancheGourmand #GreyCorner #BrunchTime #Pancakes #FoodieFes`
    },
    {
      id: 'equipe-coulisses',
      type: 'coulisses',
      label: '👨‍🍳 En Coulisses avec la Brigade',
      titleSuggestion: 'En coulisses avec nos chefs',
      caption: `En coulisses au Grey Corner 👨‍🍳✨\n\nDerrière chaque assiette servie avec le sourire se cache le travail passionné de toute notre brigade. De la sélection des produits au dressage minutieux, le souci du détail est notre fierté.\n\n❤️ Merci pour votre confiance chaque jour !\n\n#Coulisses #BrigadeDeCuisine #ChefLife #GreyCorner #Fes #PassionCuisine`
    },
    {
      id: 'mardi-marche',
      type: 'produit',
      label: '🥬 Mardi — Arrivages Frais & Saison',
      titleSuggestion: 'Arrivage frais du jour au marché',
      caption: `Sélection du jour au Grey Corner 🌿\n\nCe matin, le Chef a sélectionné les plus beaux produits de saison pour sublimer notre carte : fraîcheur absolue, terroirs préservés et saveurs authentiques.\n\nVenez déguster la carte du midi !\n\n#ProduitsFrais #ArrivageDuJour #GreyCorner #RestaurantFes #Saison #FraisEtMaison`
    },
    {
      id: 'mercredi-cuisine',
      type: 'coulisses',
      label: '🍳 Mercredi — Secret & Cuisine en Action',
      titleSuggestion: 'Cuisine en action & tour de main',
      caption: `Coup de feu et précision en cuisine 🔥\n\nChaque geste compte : la caramélisation parfaite, le dressage au millimètre et l'assaisonnement juste. C'est tout l'esprit Grey Corner qui prend vie sous vos yeux.\n\nQuelle est votre spécialité préférée chez nous ? Dites-le nous en commentaire ! 👇\n\n#ChefAtWork #CuisinePassion #GreyCorner #Gourmandise #FesFood #Restaurant`
    },
    {
      id: 'jeudi-afterwork',
      type: 'evenement',
      label: '🍹 Jeudi — Afterwork & Ambiance Détente',
      titleSuggestion: 'Afterwork & cocktails du jeudi',
      caption: `Le jeudi soir, c'est l'afterwork Grey Corner 🍹✨\n\nRejoignez-nous pour décompresser autour de nos cocktails créatifs et de nos planches à partager dans un cadre chaleureux et cosy.\n\n📍 Grey Corner — Réservations conseillées dès 18h30.\n\n#Afterwork #CocktailsFes #JeudiSoir #GreyCorner #ChillTime #TapasFes`
    }
  ],

  // Packs de hashtags pré-configurés
  HASHTAG_PACKS: {
    general: '\n\n#GreyCorner #RestaurantFes #Fes #Morocco #FoodLovers #Gastronomie #FoodieFes #BonneTable',
    viandes: '\n\n#MeatLovers #Braise #Entrecote #Grillades #SteakHouse #GreyCornerFes #GourmetFood',
    brunch: '\n\n#BrunchFes #BrunchTime #DimancheBrunch #Pancakes #CoffeeLover #BreakfastTime #GreyCorner',
    soiree: '\n\n#FridayNight #SaturdayVibes #CocktailBar #AmbianceLounge #Fesbynight #SortirAFes'
  }
};

window.Config = Config;

