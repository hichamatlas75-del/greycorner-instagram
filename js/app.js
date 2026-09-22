/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Contrôleur Principal de l'Application (js/app.js)
 * ==============================================================================
 */

const App = {
  currentEditingPost: null,
  currentEditingTemplate: null,

  async init() {
    console.log('[App] Démarrage du module Réseaux Sociaux Grey Corner...');

    // 1. Initialiser le service de données
    await DataService.init();

    // 2. Mettre à jour le badge de mode (Supabase vs Démo)
    this.updateModeBadge();

    // 3. Initialiser le calendrier sur la semaine courante
    const initialWeek = DateUtils.getIsoWeekString();
    CalendarModule.init(initialWeek);
    await CalendarModule.render();

    // 4. Initialiser le dashboard
    await DashboardModule.render();

    // 5. Vérifier les alertes de stories 24h
    await this.checkDailyStoryAlerts();

    // 6. Attacher les événements globaux
    this.bindGlobalEvents();
  },

  updateModeBadge() {
    const badge = document.getElementById('modeBadge');
    if (!badge) return;

    if (DataService.isDemo) {
      badge.className = 'mode-badge demo';
      badge.innerHTML = `<span class="mode-dot"></span> Mode Démo Local`;
      badge.title = 'Les données sont enregistrées localement dans votre navigateur. Cliquez pour configurer Supabase.';
    } else {
      badge.className = 'mode-badge live';
      badge.innerHTML = `<span class="mode-dot"></span> Supabase Connecté`;
      badge.title = 'Connecté à votre base de données PostgreSQL Supabase.';
    }
  },

  async checkDailyStoryAlerts() {
    const alertBanner = document.getElementById('globalStoryAlert');
    if (!alertBanner) return;

    const pending = await DataService.checkPendingStoryViews();
    if (pending.length > 0) {
      const days = pending.map(p => p.jour_cible.toUpperCase()).join(', ');
      alertBanner.style.display = 'flex';
      const msgEl = document.getElementById('globalStoryAlertMsg');
      if (msgEl) {
        msgEl.innerHTML = `<strong>Rappel 24H :</strong> La story du <strong>${days}</strong> a été publiée mais ses vues n'ont pas encore été relevées. Relevez les stats avant expiration !`;
      }
    } else {
      alertBanner.style.display = 'none';
    }
  },

  bindGlobalEvents() {
    // Bouton de configuration Supabase
    document.getElementById('btnOpenConfig')?.addEventListener('click', () => {
      this.openConfigModal();
    });

    document.getElementById('modeBadge')?.addEventListener('click', () => {
      this.openConfigModal();
    });

    // Fermeture des modales
    document.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Sauvegarde configuration Supabase
    document.getElementById('configForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('cfgSupabaseUrl').value.trim();
      const key = document.getElementById('cfgSupabaseKey').value.trim();
      DataService.saveCredentials(url, key);
      await DataService.init();
      this.updateModeBadge();
      await CalendarModule.render();
      await DashboardModule.render();
      document.getElementById('configModal')?.classList.remove('active');
      this.showToast(url && key ? 'Paramètres Supabase enregistrés !' : 'Mode Démo Local réactivé.');
    });

    // Réinitialisation des données de démo
    document.getElementById('btnResetDemo')?.addEventListener('click', async () => {
      if (confirm('Voulez-vous réinitialiser les données d exemple sur 4 semaines ?')) {
        DataService.resetDemoData();
        await CalendarModule.render();
        await DashboardModule.render();
        document.getElementById('configModal')?.classList.remove('active');
        this.showToast('Données démo réinitialisées.');
      }
    });

    // Formulaire d'édition / création de post
    document.getElementById('postForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSavePost();
    });

    // Gestion du téléversement d'image
    const fileInput = document.getElementById('postFileInput');
    const uploadArea = document.getElementById('uploadDropZone');

    uploadArea?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) await this.processImageUpload(file);
    });

    // Glisser-déposer
    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea?.addEventListener('drop', async (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files?.[0];
      if (file) await this.processImageUpload(file);
    });

    // Suppression du visuel joint
    document.getElementById('btnRemoveImage')?.addEventListener('click', () => {
      document.getElementById('postVisuelUrl').value = '';
      this.updateImagePreview('');
    });

    // Synchronisation de l'affichage des métriques selon le statut
    document.getElementById('postStatut')?.addEventListener('change', (e) => {
      this.toggleMetricsVisibility(e.target.value);
    });
  },

  async processImageUpload(file) {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    const uploadHint = document.getElementById('uploadHintText');
    if (uploadHint) uploadHint.textContent = 'Téléversement en cours...';

    try {
      const url = await DataService.uploadMedia(file);
      document.getElementById('postVisuelUrl').value = url;
      this.updateImagePreview(url);
      if (uploadHint) uploadHint.textContent = 'Cliquez ou glissez une image';
      this.showToast('Image chargée avec succès.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléversement de l image.');
      if (uploadHint) uploadHint.textContent = 'Cliquez ou glissez une image';
    }
  },

  updateImagePreview(url) {
    const previewWrapper = document.getElementById('imagePreviewWrapper');
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');

    if (url && url.trim() !== '') {
      previewImg.src = url;
      previewWrapper.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
    } else {
      previewImg.src = '';
      previewWrapper.style.display = 'none';
      uploadPlaceholder.style.display = 'flex';
    }
  },

  toggleMetricsVisibility(status) {
    const metricsSection = document.getElementById('metricsSection');
    if (!metricsSection) return;
    if (status === 'publie') {
      metricsSection.classList.remove('disabled');
      metricsSection.querySelectorAll('input').forEach(i => i.disabled = false);
    } else {
      metricsSection.classList.add('disabled');
    }
  },

  openEditModal(template, weekStr, existingPost) {
    this.currentEditingTemplate = template;
    this.currentEditingPost = existingPost;

    const modal = document.getElementById('editModal');
    const titleEl = document.getElementById('modalTitle');
    const slotBadgeEl = document.getElementById('modalSlotBadge');

    if (titleEl) {
      titleEl.textContent = existingPost ? `Modifier le créneau (${template.label})` : `Créer le créneau (${template.label})`;
    }

    if (slotBadgeEl) {
      slotBadgeEl.textContent = template.tag;
      slotBadgeEl.style.backgroundColor = `${template.color}20`;
      slotBadgeEl.style.color = template.color;
    }

    // Remplir les champs
    document.getElementById('postSemaine').value = weekStr;
    document.getElementById('postJourCible').value = template.jour_cible;
    document.getElementById('postType').value = template.type;
    document.getElementById('postStatut').value = existingPost?.statut || 'idee';
    document.getElementById('postTypeContenu').value = existingPost?.type_contenu || template.defaultContent;
    document.getElementById('postTitre').value = existingPost?.titre || '';
    document.getElementById('postLegende').value = existingPost?.legende || '';
    document.getElementById('postVisuelUrl').value = existingPost?.visuel_url || '';

    // Métriques
    document.getElementById('postVues').value = existingPost?.vues || 0;
    document.getElementById('postLikes').value = existingPost?.likes || 0;
    document.getElementById('postCommentaires').value = existingPost?.commentaires || 0;
    document.getElementById('postPartages').value = existingPost?.partages || 0;

    this.updateImagePreview(existingPost?.visuel_url || '');
    this.toggleMetricsVisibility(existingPost?.statut || 'idee');

    modal?.classList.add('active');
  },

  async handleSavePost() {
    const postData = {
      id: this.currentEditingPost?.id || null,
      semaine: document.getElementById('postSemaine').value,
      jour_cible: document.getElementById('postJourCible').value,
      type: document.getElementById('postType').value,
      statut: document.getElementById('postStatut').value,
      type_contenu: document.getElementById('postTypeContenu').value,
      titre: document.getElementById('postTitre').value.trim(),
      legende: document.getElementById('postLegende').value.trim(),
      visuel_url: document.getElementById('postVisuelUrl').value.trim(),
      vues: document.getElementById('postVues').value,
      likes: document.getElementById('postLikes').value,
      commentaires: document.getElementById('postCommentaires').value,
      partages: document.getElementById('postPartages').value,
      date_publication_reelle: this.currentEditingPost?.date_publication_reelle || null
    };

    if (postData.statut === 'publie' && !postData.date_publication_reelle) {
      postData.date_publication_reelle = new Date().toISOString();
    }

    try {
      await DataService.upsertPost(postData);
      document.getElementById('editModal')?.classList.remove('active');
      await CalendarModule.render();
      await DashboardModule.render();
      await this.checkDailyStoryAlerts();
      this.showToast('Créneau enregistré avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l enregistrement : ' + err.message);
    }
  },

  openConfigModal() {
    const creds = DataService.getCredentials();
    document.getElementById('cfgSupabaseUrl').value = creds.url;
    document.getElementById('cfgSupabaseKey').value = creds.key;
    document.getElementById('configModal')?.classList.add('active');
  },

  showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
};

window.App = App;

// Lancement automatique au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
