/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Couche de Données Unifiée : Supabase & Mode Démo Local (js/supabase-client.js)
 * ==============================================================================
 */

const DataService = {
  client: null,
  isDemo: true,

  // Données de départ pour le mode Démo (Semaines 36 à 39 de 2026)
  initialDemoPosts: [
    // Semaine 2026-W36
    {
      id: 'demo-w36-1',
      type: 'post',
      jour_cible: 'lundi',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      titre: 'Nouveau Plat : Entrecôte Maturée Grey Corner',
      legende: 'Découvrez notre nouvelle sélection de viandes d exception cuites à la braise.',
      date_publication_reelle: '2026-08-31T11:30:00.000Z',
      vues: 1240,
      likes: 248,
      commentaires: 26,
      partages: 14
    },
    {
      id: 'demo-w36-tue',
      type: 'story',
      jour_cible: 'mardi',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      titre: 'Arrivage de Poissons Frais',
      legende: 'Bar de ligne et dorades royales fraîchement pêchés pour la carte du soir.',
      date_publication_reelle: '2026-09-01T10:00:00.000Z',
      vues: 780,
      likes: 38,
      commentaires: 4,
      partages: 6
    },
    {
      id: 'demo-w36-wed',
      type: 'story',
      jour_cible: 'mercredi',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      titre: 'Mise en place de la Brigade',
      legende: 'Chaque détail compte pour vous offrir une expérience unique.',
      date_publication_reelle: '2026-09-02T11:15:00.000Z',
      vues: 850,
      likes: 45,
      commentaires: 7,
      partages: 9
    },
    {
      id: 'demo-w36-thu',
      type: 'story',
      jour_cible: 'jeudi',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      titre: 'Jeudi Afterwork & Tapas',
      legende: 'Rendez-vous après le bureau pour un verre entre amis.',
      date_publication_reelle: '2026-09-03T18:30:00.000Z',
      vues: 990,
      likes: 56,
      commentaires: 9,
      partages: 14
    },
    {
      id: 'demo-w36-2',
      type: 'story',
      jour_cible: 'vendredi',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      titre: 'Ambiance du vendredi soir',
      legende: 'Cocktails signature & terrasse illuminée pour bien démarrer le week-end.',
      date_publication_reelle: '2026-09-04T18:00:00.000Z',
      vues: 820,
      likes: 42,
      commentaires: 5,
      partages: 8
    },
    {
      id: 'demo-w36-3',
      type: 'story',
      jour_cible: 'samedi',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
      titre: 'Soirée Live Acoustique',
      legende: 'Complet ce soir ! Merci à tous pour cette énergie magnifique.',
      date_publication_reelle: '2026-09-05T19:15:00.000Z',
      vues: 1050,
      likes: 68,
      commentaires: 12,
      partages: 19
    },
    {
      id: 'demo-w36-4',
      type: 'story',
      jour_cible: 'dimanche',
      semaine: '2026-W36',
      statut: 'publie',
      type_contenu: 'promo',
      visuel_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      titre: 'Formule Brunch du Dimanche',
      legende: 'Dernier service gourmand avant la nouvelle semaine.',
      date_publication_reelle: '2026-09-06T10:45:00.000Z',
      vues: 740,
      likes: 31,
      commentaires: 3,
      partages: 4
    },

    // Semaine 2026-W37
    {
      id: 'demo-w37-1',
      type: 'post',
      jour_cible: 'lundi',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      titre: 'Salade Fraîcheur & Burrata Crémeuse',
      legende: 'Légèreté et saveurs de saison à la carte cette semaine.',
      date_publication_reelle: '2026-09-07T12:00:00.000Z',
      vues: 1410,
      likes: 312,
      commentaires: 38,
      partages: 22
    },
    {
      id: 'demo-w37-tue',
      type: 'story',
      jour_cible: 'mardi',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      titre: 'Arrivage de Truffes de Saison',
      legende: 'Parfum envoûtant en cuisine pour nos plats d exception.',
      date_publication_reelle: '2026-09-08T10:30:00.000Z',
      vues: 920,
      likes: 51,
      commentaires: 6,
      partages: 10
    },
    {
      id: 'demo-w37-wed',
      type: 'story',
      jour_cible: 'mercredi',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      titre: 'Dressage Minute par le Chef',
      legende: 'Quand la gastronomie devient un art au millimètre.',
      date_publication_reelle: '2026-09-09T11:45:00.000Z',
      vues: 890,
      likes: 47,
      commentaires: 5,
      partages: 8
    },
    {
      id: 'demo-w37-thu',
      type: 'story',
      jour_cible: 'jeudi',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      titre: 'Soirée Cocktails & Tapas',
      legende: 'Ambiance feutrée au bar du Grey Corner.',
      date_publication_reelle: '2026-09-10T19:00:00.000Z',
      vues: 1100,
      likes: 72,
      commentaires: 11,
      partages: 16
    },
    {
      id: 'demo-w37-2',
      type: 'story',
      jour_cible: 'vendredi',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
      titre: 'En cuisine avec le Chef',
      legende: 'Préparation des sauces maison pour le service du soir.',
      date_publication_reelle: '2026-09-11T18:30:00.000Z',
      vues: 910,
      likes: 54,
      commentaires: 8,
      partages: 11
    },
    {
      id: 'demo-w37-3',
      type: 'story',
      jour_cible: 'samedi',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
      titre: 'Dîner Privé en Terrasse',
      legende: 'Atmosphère feutrée pour un événement exclusif au Grey Corner.',
      date_publication_reelle: '2026-09-12T20:00:00.000Z',
      vues: 1230,
      likes: 95,
      commentaires: 18,
      partages: 27
    },
    {
      id: 'demo-w37-4',
      type: 'story',
      jour_cible: 'dimanche',
      semaine: '2026-W37',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      titre: 'Café & Pâtisserie Signature',
      legende: 'Le moment réconfort du dimanche après-midi.',
      date_publication_reelle: '2026-09-13T11:00:00.000Z',
      vues: 880,
      likes: 47,
      commentaires: 4,
      partages: 7
    },

    // Semaine 2026-W38
    {
      id: 'demo-w38-1',
      type: 'post',
      jour_cible: 'lundi',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'promo',
      visuel_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      titre: 'Menu Déjeuner Express du Midi',
      legende: 'Une formule équilibrée servie en moins de 30 minutes.',
      date_publication_reelle: '2026-09-14T11:45:00.000Z',
      vues: 1180,
      likes: 215,
      commentaires: 19,
      partages: 15
    },
    {
      id: 'demo-w38-tue',
      type: 'story',
      jour_cible: 'mardi',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      titre: 'Arrivage du Maraîcher Local',
      legende: 'Des herbes fraîches et légumes bio pour rehausser nos assiettes.',
      date_publication_reelle: '2026-09-15T10:00:00.000Z',
      vues: 810,
      likes: 41,
      commentaires: 4,
      partages: 7
    },
    {
      id: 'demo-w38-wed',
      type: 'story',
      jour_cible: 'mercredi',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      titre: 'Technique & Précision en Cuisine',
      legende: 'La passion du fait maison dans chaque préparation.',
      date_publication_reelle: '2026-09-16T11:30:00.000Z',
      vues: 870,
      likes: 44,
      commentaires: 5,
      partages: 8
    },
    {
      id: 'demo-w38-thu',
      type: 'story',
      jour_cible: 'jeudi',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      titre: 'Soirée Mocktails & Cocktails',
      legende: 'L endroit parfait pour amorcer le week-end en douceur.',
      date_publication_reelle: '2026-09-17T18:45:00.000Z',
      vues: 1040,
      likes: 67,
      commentaires: 10,
      partages: 15
    },
    {
      id: 'demo-w38-2',
      type: 'story',
      jour_cible: 'vendredi',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=80',
      titre: 'Mise en place salle & bar',
      legende: 'L équipe peaufine les derniers détails avant votre arrivée.',
      date_publication_reelle: '2026-09-18T19:00:00.000Z',
      vues: 870,
      likes: 48,
      commentaires: 6,
      partages: 9
    },
    {
      id: 'demo-w38-3',
      type: 'story',
      jour_cible: 'samedi',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
      titre: 'Soirée Dégustation Vins & Tapas',
      legende: 'Moments partagés autour de notre cave sélectionnée.',
      date_publication_reelle: '2026-09-19T20:30:00.000Z',
      vues: 1190,
      likes: 89,
      commentaires: 14,
      partages: 21
    },
    {
      id: 'demo-w38-4',
      type: 'story',
      jour_cible: 'dimanche',
      semaine: '2026-W38',
      statut: 'publie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?auto=format&fit=crop&w=800&q=80',
      titre: 'Fin de service et remerciements',
      legende: 'Une belle semaine s achève. Rendez-vous demain dès midi !',
      date_publication_reelle: '2026-09-20T11:15:00.000Z',
      vues: 810,
      likes: 39,
      commentaires: 2,
      partages: 5
    },

    // Semaine 2026-W39 (Semaine courante)
    {
      id: 'demo-w39-1',
      type: 'post',
      jour_cible: 'lundi',
      semaine: '2026-W39',
      statut: 'publie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      titre: 'Pizza Truffe & Champignons Sauvages',
      legende: 'Notre incontournable de l automne fait son grand retour !',
      date_publication_reelle: '2026-09-21T11:00:00.000Z',
      vues: 1350,
      likes: 290,
      commentaires: 34,
      partages: 18
    },
    {
      id: 'demo-w39-tue',
      type: 'story',
      jour_cible: 'mardi',
      semaine: '2026-W39',
      statut: 'planifie',
      type_contenu: 'produit',
      visuel_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      titre: 'Arrivage du Marché & Légumes Croquants',
      legende: 'Fraîcheur absolue ce matin en cuisine pour vos déjeuners.',
      date_publication_reelle: null,
      vues: 0,
      likes: 0,
      commentaires: 0,
      partages: 0
    },
    {
      id: 'demo-w39-wed',
      type: 'story',
      jour_cible: 'mercredi',
      semaine: '2026-W39',
      statut: 'planifie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      titre: 'La Brigade en Pleine Action',
      legende: 'Dressage minute et concentration maximale avant le service.',
      date_publication_reelle: null,
      vues: 0,
      likes: 0,
      commentaires: 0,
      partages: 0
    },
    {
      id: 'demo-w39-thu',
      type: 'story',
      jour_cible: 'jeudi',
      semaine: '2026-W39',
      statut: 'planifie',
      type_contenu: 'evenement',
      visuel_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      titre: 'Afterwork & Cocktails Signatures',
      legende: 'Le jeudi soir, décompressez autour de nos créations du bar.',
      date_publication_reelle: null,
      vues: 0,
      likes: 0,
      commentaires: 0,
      partages: 0
    },
    {
      id: 'demo-w39-2',
      type: 'story',
      jour_cible: 'vendredi',
      semaine: '2026-W39',
      statut: 'planifie',
      type_contenu: 'coulisses',
      visuel_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      titre: 'Arrivage frais du marché',
      legende: 'Sélection matinale pour un week-end d exception.',
      date_publication_reelle: null,
      vues: 0,
      likes: 0,
      commentaires: 0,
      partages: 0
    },
    {
      id: 'demo-w39-3',
      type: 'story',
      jour_cible: 'samedi',
      semaine: '2026-W39',
      statut: 'idee',
      type_contenu: 'evenement',
      visuel_url: '',
      titre: 'Soirée DJ Lounge',
      legende: '',
      date_publication_reelle: null,
      vues: 0,
      likes: 0,
      commentaires: 0,
      partages: 0
    },
    {
      id: 'demo-w39-4',
      type: 'story',
      jour_cible: 'dimanche',
      semaine: '2026-W39',
      statut: 'idee',
      type_contenu: 'promo',
      visuel_url: '',
      titre: 'Brunch en famille',
      legende: '',
      date_publication_reelle: null,
      vues: 0,
      likes: 0,
      commentaires: 0,
      partages: 0
    }
  ],

  // Banque de visuels initiale pour la réserve de photos
  initialDemoMedia: [
    {
      id: 'media-demo-1',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      titre: 'Côtes d\'Agneau Grillées & Romarin',
      type_contenu: 'produit',
      statut: 'disponible',
      created_at: '2026-09-15T10:00:00Z'
    },
    {
      id: 'media-demo-2',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      titre: 'Burger Gourmet Grey Corner & Frites Maison',
      type_contenu: 'produit',
      statut: 'disponible',
      created_at: '2026-09-16T11:00:00Z'
    },
    {
      id: 'media-demo-3',
      url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      titre: 'Dessert Signature : Fondant Chocolat Cœur Coulant',
      type_contenu: 'produit',
      statut: 'disponible',
      created_at: '2026-09-17T14:00:00Z'
    },
    {
      id: 'media-demo-4',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      titre: 'Cocktail Création "Grey Sunset" au Bar',
      type_contenu: 'coulisses',
      statut: 'disponible',
      created_at: '2026-09-18T16:00:00Z'
    },
    {
      id: 'media-demo-5',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      titre: 'Entrecôte Maturée 30 jours à la Braise',
      type_contenu: 'produit',
      statut: 'publie',
      created_at: '2026-08-30T09:00:00Z'
    },
    {
      id: 'media-demo-6',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      titre: 'Salade Italienne & Burrata des Pouilles',
      type_contenu: 'produit',
      statut: 'publie',
      created_at: '2026-09-06T10:00:00Z'
    }
  ],

  /**
   * Initialisation du service de données
   */
  async init() {
    const url = localStorage.getItem(Config.STORAGE_KEYS.SUPABASE_URL) || Config.DEFAULT_SUPABASE_URL;
    const key = localStorage.getItem(Config.STORAGE_KEYS.SUPABASE_KEY) || Config.DEFAULT_SUPABASE_KEY;

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isDemo = false;
        console.log('[DataService] Connecté à Supabase avec succès.');
        return;
      } catch (e) {
        console.warn('[DataService] Échec connexion Supabase, repli sur le mode Démo.', e);
      }
    }

    // Sinon, initialiser le stockage local Démo s'il est vide
    this.isDemo = true;
    if (!localStorage.getItem(Config.STORAGE_KEYS.DATA_STORE)) {
      this.saveLocalStore(this.initialDemoPosts);
    }
    if (!localStorage.getItem(Config.STORAGE_KEYS.MEDIA_STORE)) {
      this.saveLocalMediaStore(this.initialDemoMedia);
    }
  },

  getLocalStore() {
    try {
      const raw = localStorage.getItem(Config.STORAGE_KEYS.DATA_STORE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveLocalStore(posts) {
    try {
      localStorage.setItem(Config.STORAGE_KEYS.DATA_STORE, JSON.stringify(posts));
    } catch (e) {
      console.error('[DataService] Erreur lors de la sauvegarde locale', e);
    }
  },

  /**
   * Récupère tous les posts pour une semaine donnée
   */
  async getPostsForWeek(weekStr) {
    if (!this.isDemo && this.client) {
      const { data, error } = await this.client
        .from('posts')
        .select('*')
        .eq('semaine', weekStr)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    // Mode Démo
    const all = this.getLocalStore();
    return all.filter(p => p.semaine === weekStr);
  },

  /**
   * Récupère l'ensemble des posts (pour les statistiques du dashboard)
   */
  async getAllPosts() {
    if (!this.isDemo && this.client) {
      const { data, error } = await this.client
        .from('posts')
        .select('*')
        .order('semaine', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    return this.getLocalStore();
  },

  /**
   * Enregistre ou met à jour une publication
   */
  async upsertPost(postData) {
    const record = {
      ...postData,
      vues: parseInt(postData.vues, 10) || 0,
      likes: parseInt(postData.likes, 10) || 0,
      commentaires: parseInt(postData.commentaires, 10) || 0,
      partages: parseInt(postData.partages, 10) || 0,
      updated_at: new Date().toISOString()
    };

    if (!this.isDemo && this.client) {
      // Si nouvel ID
      if (!record.id) {
        delete record.id;
        const { data, error } = await this.client
          .from('posts')
          .insert([record])
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.client
          .from('posts')
          .update(record)
          .eq('id', record.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }

    // Mode Démo
    const all = this.getLocalStore();
    if (!record.id) {
      record.id = 'demo-' + Date.now();
      all.push(record);
    } else {
      const idx = all.findIndex(p => p.id === record.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...record };
      } else {
        all.push(record);
      }
    }
    this.saveLocalStore(all);
    return record;
  },

  /**
   * Supprime un post
   */
  async deletePost(id) {
    if (!this.isDemo && this.client) {
      const { error } = await this.client
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }

    const all = this.getLocalStore().filter(p => p.id !== id);
    this.saveLocalStore(all);
    return true;
  },

  /**
   * Pré-remplit automatiquement les 7 créneaux vides ('idee') pour une semaine donnée
   */
  async autoPrefillWeek(weekStr) {
    const existing = await this.getPostsForWeek(weekStr);
    const existingDays = new Set(existing.map(p => p.jour_cible));

    const toInsert = [];
    for (const template of Config.WEEKLY_TEMPLATE) {
      if (!existingDays.has(template.jour_cible)) {
        toInsert.push({
          semaine: weekStr,
          jour_cible: template.jour_cible,
          type: template.type,
          statut: 'idee',
          type_contenu: template.defaultContent,
          titre: template.label,
          legende: template.description,
          visuel_url: '',
          vues: 0,
          likes: 0,
          commentaires: 0,
          partages: 0
        });
      }
    }

    if (toInsert.length === 0) return existing;

    if (!this.isDemo && this.client) {
      const { data, error } = await this.client
        .from('posts')
        .insert(toInsert)
        .select();
      if (error) throw error;
      return [...existing, ...(data || [])];
    }

    // Mode Démo
    const all = this.getLocalStore();
    const inserted = toInsert.map((item, idx) => ({
      ...item,
      id: `demo-${weekStr}-${item.jour_cible}-${Date.now()}-${idx}`
    }));
    all.push(...inserted);
    this.saveLocalStore(all);
    return [...existing, ...inserted];
  },

  /**
   * Téléversement de visuel vers Supabase Storage (ou conversion base64 en mode démo)
   */
  async uploadMedia(file) {
    if (!this.isDemo && this.client) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await this.client.storage
        .from('instagram-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Récupération de l'URL publique
      const { data: publicData } = this.client.storage
        .from('instagram-media')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    }

    // Mode Démo : lecture en Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Vérifie si des stories publiées aujourd'hui ou hier nécessitent un relevé de vues (alerte 24h)
   */
  async checkPendingStoryViews() {
    const currentDay = DateUtils.getCurrentDayFr();
    const currentWeek = DateUtils.getIsoWeekString();

    const posts = await this.getPostsForWeek(currentWeek);
    
    // Filtrer les stories publiées de vendredi, samedi ou dimanche avec 0 vues
    return posts.filter(p => 
      p.type === 'story' && 
      p.statut === 'publie' && 
      (!p.vues || p.vues === 0)
    );
  },

  /**
   * Sauvegarde des paramètres de connexion Supabase
   */
  saveCredentials(url, key) {
    if (url && key) {
      localStorage.setItem(Config.STORAGE_KEYS.SUPABASE_URL, url.trim());
      localStorage.setItem(Config.STORAGE_KEYS.SUPABASE_KEY, key.trim());
    } else {
      localStorage.removeItem(Config.STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(Config.STORAGE_KEYS.SUPABASE_KEY);
    }
  },

  getCredentials() {
    return {
      url: localStorage.getItem(Config.STORAGE_KEYS.SUPABASE_URL) || Config.DEFAULT_SUPABASE_URL || '',
      key: localStorage.getItem(Config.STORAGE_KEYS.SUPABASE_KEY) || Config.DEFAULT_SUPABASE_KEY || ''
    };
  },

  resetDemoData() {
    this.saveLocalStore(this.initialDemoPosts);
    this.saveLocalMediaStore(this.initialDemoMedia);
  },

  getLocalMediaStore() {
    try {
      const raw = localStorage.getItem(Config.STORAGE_KEYS.MEDIA_STORE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveLocalMediaStore(media) {
    try {
      localStorage.setItem(Config.STORAGE_KEYS.MEDIA_STORE, JSON.stringify(media));
    } catch (e) {
      console.error('[DataService] Erreur sauvegarde médiathèque', e);
    }
  },

  async getMediaLibrary() {
    if (!this.isDemo && this.client) {
      try {
        const { data, error } = await this.client
          .from('media_library')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DataService] Table media_library non trouvée sur Supabase, repli local.', err);
      }
    }
    return this.getLocalMediaStore();
  },

  async addMediaItem({ url, titre = '', type_contenu = 'produit' }) {
    const item = {
      url,
      titre: titre.trim() || 'Visuel sans titre',
      type_contenu,
      statut: 'disponible',
      created_at: new Date().toISOString()
    };

    if (!this.isDemo && this.client) {
      try {
        const { data, error } = await this.client
          .from('media_library')
          .insert([item])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DataService] Erreur insertion Supabase media_library', err);
      }
    }

    const all = this.getLocalMediaStore();
    item.id = 'media-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    all.unshift(item);
    this.saveLocalMediaStore(all);
    return item;
  },

  async deleteMediaItem(id) {
    if (!this.isDemo && this.client) {
      try {
        await this.client.from('media_library').delete().eq('id', id);
      } catch (e) {}
    }
    const all = this.getLocalMediaStore().filter(m => m.id !== id);
    this.saveLocalMediaStore(all);
    return true;
  },

  async updateMediaStatus(id, statut, postId = null) {
    if (!this.isDemo && this.client) {
      try {
        await this.client
          .from('media_library')
          .update({ statut, post_id: postId })
          .eq('id', id);
      } catch (e) {}
    }
    const all = this.getLocalMediaStore();
    const target = all.find(m => m.id === id);
    if (target) {
      target.statut = statut;
      target.post_id = postId;
      this.saveLocalMediaStore(all);
    }
  },

  // ─── AUTHENTIFICATION PAR EMAIL (SUPABASE AUTH & SESSION) ───
  async getCurrentUser() {
    if (!this.isDemo && this.client) {
      try {
        const { data: { user }, error } = await this.client.auth.getUser();
        if (error) return null;
        return user;
      } catch (e) {
        return null;
      }
    }
    const saved = localStorage.getItem('gc_auth_demo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && !parsed.email.includes('visiteur')) {
          return parsed;
        }
      } catch (e) {}
      localStorage.removeItem('gc_auth_demo_user');
    }
    return null;
  },

  async getSession() {
    if (!this.isDemo && this.client) {
      try {
        const { data: { session }, error } = await this.client.auth.getSession();
        if (error) return null;
        return session;
      } catch (e) {
        return null;
      }
    }
    const user = await this.getCurrentUser();
    return user ? { user } : null;
  },

  async signInWithEmailPassword(email, password) {
    if (!this.isDemo && this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (error) throw error;
      return data.user;
    }
    // Simulation mode démo
    const demoUser = { email: email.trim(), id: 'demo-user-1', app_metadata: { role: 'admin' } };
    localStorage.setItem('gc_auth_demo_user', JSON.stringify(demoUser));
    return demoUser;
  },

  async signUpWithEmailPassword(email, password) {
    if (!this.isDemo && this.client) {
      const { data, error } = await this.client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data.user;
    }
    const demoUser = { email: email.trim(), id: 'demo-user-1', app_metadata: { role: 'admin' } };
    localStorage.setItem('gc_auth_demo_user', JSON.stringify(demoUser));
    return demoUser;
  },

  async signInWithMagicLink(email) {
    if (!this.isDemo && this.client) {
      const { data, error } = await this.client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    }
    const demoUser = { email: email.trim(), id: 'demo-user-1' };
    localStorage.setItem('gc_auth_demo_user', JSON.stringify(demoUser));
    return { user: demoUser };
  },

  async signOut() {
    if (!this.isDemo && this.client) {
      try {
        await this.client.auth.signOut();
      } catch (e) {
        console.warn('Erreur lors du signOut Supabase', e);
      }
    }
    localStorage.removeItem('gc_auth_demo_user');
  },

  onAuthStateChange(callback) {
    if (!this.isDemo && this.client) {
      const { data: { subscription } } = this.client.auth.onAuthStateChange(callback);
      return subscription;
    }
    return { unsubscribe: () => {} };
  }
};

window.DataService = DataService;
