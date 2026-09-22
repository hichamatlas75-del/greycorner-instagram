/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Contrôleur Principal de l'Application (js/app.js)
 * ==============================================================================
 */

const App = {
  currentEditingPost: null,
  currentEditingTemplate: null,
  isMediaPickerMode: false,
  activeLibFilter: 'all',
  currentUser: null,

  async init() {
    console.log('[App] Démarrage du module Réseaux Sociaux Grey Corner...');

    // 1. Initialiser le service de données
    await DataService.init();

    // 2. Mettre à jour le badge de mode (Supabase vs Démo)
    this.updateModeBadge();

    // 3. Initialiser le calendrier sur la semaine courante
    const initialWeek = DateUtils.getIsoWeekString();
    CalendarModule.init(initialWeek);

    // 4. Initialiser et écouter l'authentification (Contenu sensible)
    await this.initAuth();

    // 5. Attacher les événements globaux
    this.bindGlobalEvents();
  },

  async initAuth() {
    // Écouter les changements d'état Supabase Auth
    DataService.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Événement Supabase Auth:', event, session?.user?.email);
      if (session && session.user) {
        await this.setAuthenticatedState(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.setUnauthenticatedState();
      }
    });

    // Vérifier si un utilisateur a déjà une session active
    const user = await DataService.getCurrentUser();
    if (user) {
      await this.setAuthenticatedState(user);
    } else {
      this.setUnauthenticatedState();
    }

    // Brancher les formulaires de l'Auth Gate
    this.bindAuthEvents();
  },

  async setAuthenticatedState(user) {
    this.currentUser = user;
    document.body.classList.remove('auth-locked');
    document.body.classList.add('auth-unlocked');

    const emailDisplay = document.getElementById('userEmailDisplay');
    if (emailDisplay) {
      emailDisplay.textContent = user.email || 'Équipe Grey Corner';
      emailDisplay.title = user.email || '';
    }

    const badge = document.getElementById('userProfileBadge');
    if (badge) badge.style.display = 'inline-flex';

    const authGate = document.getElementById('authGate');
    if (authGate) authGate.style.display = 'none';

    // Déverrouiller et rafraîchir le contenu sensible
    try {
      await CalendarModule.render();
      await DashboardModule.render();
      await this.checkDailyStoryAlerts();
      await this.updateMediaBadge();
    } catch (e) {
      console.warn('Erreur rendu contenu sensible post-auth:', e);
    }
  },

  setUnauthenticatedState() {
    this.currentUser = null;
    document.body.classList.remove('auth-unlocked');
    document.body.classList.add('auth-locked');

    const badge = document.getElementById('userProfileBadge');
    if (badge) badge.style.display = 'none';

    const authGate = document.getElementById('authGate');
    if (authGate) authGate.style.display = 'flex';

    // Réinitialiser les messages d'état
    const magicFeedback = document.getElementById('magicFeedback');
    if (magicFeedback) {
      magicFeedback.style.display = 'none';
      magicFeedback.className = 'auth-feedback';
      magicFeedback.innerHTML = '';
    }
    const pwdFeedback = document.getElementById('pwdFeedback');
    if (pwdFeedback) {
      pwdFeedback.style.display = 'none';
      pwdFeedback.className = 'auth-feedback';
      pwdFeedback.innerHTML = '';
    }
  },

  bindAuthEvents() {
    const tabMagic = document.getElementById('tabMagicLink');
    const tabPassword = document.getElementById('tabPassword');
    const formMagic = document.getElementById('formMagicLink');
    const formPassword = document.getElementById('formPassword');

    tabMagic?.addEventListener('click', () => {
      tabMagic.classList.add('active');
      tabMagic.setAttribute('aria-selected', 'true');
      tabPassword?.classList.remove('active');
      tabPassword?.setAttribute('aria-selected', 'false');
      if (formMagic) formMagic.style.display = 'flex';
      if (formPassword) formPassword.style.display = 'none';
    });

    tabPassword?.addEventListener('click', () => {
      tabPassword.classList.add('active');
      tabPassword.setAttribute('aria-selected', 'true');
      tabMagic?.classList.remove('active');
      tabMagic?.setAttribute('aria-selected', 'false');
      if (formPassword) formPassword.style.display = 'flex';
      if (formMagic) formMagic.style.display = 'none';
    });

    // Formulaire Lien Magique (Email direct)
    formMagic?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('magicEmail')?.value.trim();
      const btnSubmit = document.getElementById('btnSubmitMagic');
      const feedback = document.getElementById('magicFeedback');

      if (!email || !email.includes('@')) {
        this.showAuthFeedback(feedback, 'error', 'Veuillez renseigner une adresse email valide.');
        return;
      }

      try {
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<span>⏳</span> Envoi en cours...';
        }
        this.showAuthFeedback(feedback, 'info', 'Génération et envoi du lien sécurisé...');

        const result = await DataService.signInWithMagicLink(email);

        if (DataService.isDemo) {
          this.showAuthFeedback(feedback, 'success', '✨ [Mode Démo] Connexion instantanée réussie ! Chargement...');
          setTimeout(async () => {
            await this.setAuthenticatedState(result.user || { email });
            this.showToast(`Bienvenue, ${email} !`);
          }, 600);
        } else {
          this.showAuthFeedback(feedback, 'success', `📨 <strong>Lien magique envoyé avec succès !</strong><br>Veuillez ouvrir votre boîte mail <u>${CalendarModule.escapeHtml(email)}</u> et cliquer sur le lien pour vous connecter automatiquement.`);
        }
      } catch (err) {
        console.error('[Auth] Erreur magic link:', err);
        this.showAuthFeedback(feedback, 'error', `⚠️ Erreur : ${err.message || 'Impossible d\'envoyer le lien magique.'}`);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>📨</span> M\'envoyer mon lien de connexion';
        }
      }
    });

    // Formulaire Mot de passe (Connexion)
    formPassword?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('pwdEmail')?.value.trim();
      const password = document.getElementById('pwdPassword')?.value;
      const btnSubmit = document.getElementById('btnSubmitPassword');
      const feedback = document.getElementById('pwdFeedback');

      if (!email || !password) {
        this.showAuthFeedback(feedback, 'error', 'Veuillez saisir votre email et votre mot de passe.');
        return;
      }

      try {
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<span>⏳</span> Connexion en cours...';
        }
        this.showAuthFeedback(feedback, 'info', 'Vérification de vos identifiants...');

        const user = await DataService.signInWithEmailPassword(email, password);
        this.showAuthFeedback(feedback, 'success', 'Connexion réussie ! Déverrouillage de l\'espace...');
        setTimeout(async () => {
          await this.setAuthenticatedState(user);
          this.showToast(`Bienvenue, ${user.email} !`);
        }, 500);
      } catch (err) {
        console.error('[Auth] Erreur connexion mot de passe:', err);
        const msg = err.message || '';
        if (msg.includes('Invalid login credentials')) {
          this.showAuthFeedback(feedback, 'error', 'Identifiants invalides. Vérifiez l\'adresse email ou le mot de passe, ou cliquez sur "Créer un compte".');
        } else {
          this.showAuthFeedback(feedback, 'error', `⚠️ Erreur : ${msg}`);
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>🔐</span> Se connecter';
        }
      }
    });

    // Inscription (Création d'un compte)
    document.getElementById('btnSubmitSignUp')?.addEventListener('click', async () => {
      const email = document.getElementById('pwdEmail')?.value.trim();
      const password = document.getElementById('pwdPassword')?.value;
      const btnSignUp = document.getElementById('btnSubmitSignUp');
      const feedback = document.getElementById('pwdFeedback');

      if (!email || !password) {
        this.showAuthFeedback(feedback, 'error', 'Veuillez renseigner un email et un mot de passe pour créer votre compte.');
        return;
      }

      if (password.length < 6) {
        this.showAuthFeedback(feedback, 'error', 'Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }

      try {
        if (btnSignUp) {
          btnSignUp.disabled = true;
          btnSignUp.innerHTML = '<span>⏳</span> Création...';
        }
        this.showAuthFeedback(feedback, 'info', 'Création du compte en cours...');

        const user = await DataService.signUpWithEmailPassword(email, password);
        if (DataService.isDemo) {
          this.showAuthFeedback(feedback, 'success', '✨ [Mode Démo] Compte créé et session activée !');
          setTimeout(async () => {
            await this.setAuthenticatedState(user);
            this.showToast(`Bienvenue, ${user.email} !`);
          }, 500);
        } else {
          this.showAuthFeedback(feedback, 'success', `✉️ <strong>Compte créé avec succès !</strong><br>Si la confirmation d'email est requise sur votre projet Supabase, vérifiez la boîte <u>${CalendarModule.escapeHtml(email)}</u> pour valider votre compte.`);
        }
      } catch (err) {
        console.error('[Auth] Erreur inscription:', err);
        this.showAuthFeedback(feedback, 'error', `⚠️ Erreur d'inscription : ${err.message}`);
      } finally {
        if (btnSignUp) {
          btnSignUp.disabled = false;
          btnSignUp.innerHTML = '<span>✨</span> Créer un compte';
        }
      }
    });

    // Déconnexion
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
      if (confirm('Voulez-vous vous déconnecter et reverrouiller le contenu ?')) {
        await DataService.signOut();
        this.setUnauthenticatedState();
        this.showToast('🚪 Espace déconnecté et reverrouillé avec succès.');
      }
    });

    // Accès visiteur / démo
    document.getElementById('btnBypassDemo')?.addEventListener('click', async () => {
      const demoUser = { email: 'visiteur@greycorner.fr', id: 'demo-visiteur', role: 'demo' };
      localStorage.setItem('gc_auth_demo_user', JSON.stringify(demoUser));
      await this.setAuthenticatedState(demoUser);
      this.showToast('🧪 Accès en mode Démo Local accordé.');
    });
  },

  showAuthFeedback(el, type, html) {
    if (!el) return;
    el.className = `auth-feedback ${type}`;
    el.innerHTML = html;
    el.style.display = 'block';
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

    // ─── ÉVÉNEMENTS DE LA BANQUE DE VISUELS ───
    // Ouverture depuis l'en-tête
    document.getElementById('btnOpenMediaLibrary')?.addEventListener('click', () => {
      this.openMediaLibrary(false);
    });

    // Sélection depuis la modale de créneau
    document.getElementById('btnPickFromLibrary')?.addEventListener('click', () => {
      this.openMediaLibrary(true);
    });

    // Upload multiple de photos
    const libFileInput = document.getElementById('libFileInput');
    document.getElementById('btnUploadMultipleMedia')?.addEventListener('click', () => {
      libFileInput?.click();
    });

    libFileInput?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const titreBase = document.getElementById('libTitre')?.value.trim() || '';
      const typeContenu = document.getElementById('libType')?.value || 'produit';

      this.showToast(`Téléversement de ${files.length} photo${files.length > 1 ? 's' : ''}...`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const url = await DataService.uploadMedia(file);
          const itemTitle = files.length === 1 && titreBase ? titreBase : (titreBase ? `${titreBase} (${i + 1})` : file.name.replace(/\.[^/.]+$/, ""));
          await DataService.addMediaItem({
            url,
            titre: itemTitle,
            type_contenu: typeContenu
          });
        } catch (err) {
          console.error('Erreur téléversement media', err);
        }
      }

      libFileInput.value = '';
      if (document.getElementById('libTitre')) document.getElementById('libTitre').value = '';
      await this.renderMediaLibrary();
      await this.updateMediaBadge();
      this.showToast(`🎉 ${files.length} photo${files.length > 1 ? 's ajoutées' : ' ajoutée'} à la réserve !`);
    });

    // Filtres de la médiathèque
    document.querySelectorAll('[data-lib-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-lib-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeLibFilter = btn.dataset.libFilter;
        this.renderMediaLibrary();
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

    // Outils d'aide à la légende
    document.getElementById('btnSuggestCaption')?.addEventListener('click', () => {
      this.suggestCaptionForCurrentSlot();
    });

    document.getElementById('btnAddHashtags')?.addEventListener('click', () => {
      this.addHashtagsToCaption();
    });

    document.getElementById('btnBrowseTemplates')?.addEventListener('click', () => {
      this.openCaptionTemplatesModal();
    });

    // Changement de format Instagram (Story 24h vs Post Feed)
    document.getElementById('postType')?.addEventListener('change', (e) => {
      const newType = e.target.value;
      this.updateFormatGuide(newType);
      const slotBadgeEl = document.getElementById('modalSlotBadge');
      if (slotBadgeEl) {
        slotBadgeEl.textContent = newType === 'story' ? 'Story 24h' : 'Post Feed';
      }
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

    // Raccourcis de publication dans la modale
    document.getElementById('btnModalCopyCaption')?.addEventListener('click', () => {
      const caption = document.getElementById('postLegende')?.value || '';
      if (!caption.trim()) {
        this.showToast('Veuillez d\'abord saisir une légende.');
        return;
      }
      this.copyTextToClipboard(caption);
    });

    // ─── ÉVÉNEMENTS DU LIGHTBOX (VISIONNEUSE PLEIN ÉCRAN) ───
    document.addEventListener('click', (e) => {
      // Ignorer les clics sur boutons, liens ou champs de saisie
      if (e.target.closest('button, a, input, select, textarea')) return;

      const trigger = e.target.closest('.has-lightbox, [data-lightbox], .slot-zoom-overlay, .media-zoom-overlay, .preview-zoom-overlay');
      if (trigger) {
        let img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
        if (img && img.src && !img.src.includes('placeholder')) {
          e.stopPropagation();
          const url = img.dataset.lightbox || img.src;
          const caption = img.dataset.caption || img.alt || 'Visuel Grey Corner';
          this.openLightbox(url, caption);
        }
      }
    });

    document.getElementById('btnCloseLightbox')?.addEventListener('click', () => {
      this.closeLightbox();
    });

    document.getElementById('lightboxStage')?.addEventListener('click', (e) => {
      if (e.target.id === 'lightboxStage') {
        this.closeLightbox();
      }
    });

    document.getElementById('btnLightboxDownload')?.addEventListener('click', () => {
      const img = document.getElementById('lightboxImg');
      if (img && img.src) {
        this.downloadImageFile(img.src, 'greycorner-visuel');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeLightbox();
      }
    });
  },

  openLightbox(url, caption = '') {
    if (!url) return;
    const lightbox = document.getElementById('imageLightbox');
    const imgEl = document.getElementById('lightboxImg');
    const captionEl = document.getElementById('lightboxCaption');
    const openTabBtn = document.getElementById('btnLightboxOpenTab');

    if (!lightbox || !imgEl) return;

    imgEl.src = url;
    if (captionEl) captionEl.textContent = caption || 'Visuel Grey Corner';
    if (openTabBtn) openTabBtn.href = url;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  },

  async copyTextToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.showToast('📋 Légende copiée ! Vous pouvez la coller sur Instagram.');
    } catch (e) {
      this.showToast('Impossible de copier automatiquement le texte.');
    }
  },

  async downloadImageFile(url, filename = 'greycorner-instagram') {
    try {
      this.showToast('⬇️ Téléchargement de l\'image...');
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.showToast('⬇️ Image enregistrée !');
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = url.split('.').pop().split(/[?#]/)[0] || 'jpg';
      a.download = `${filename}.${ext.length <= 4 ? ext : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      this.showToast('⬇️ Image enregistrée !');
    } catch (err) {
      window.open(url, '_blank');
      this.showToast('Image ouverte pour enregistrement.');
    }
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
      previewImg.dataset.lightbox = url;
      previewImg.dataset.caption = document.getElementById('postTitre')?.value || 'Aperçu du visuel';
      previewWrapper.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
    } else {
      previewImg.src = '';
      previewImg.dataset.lightbox = '';
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

    const currentType = existingPost?.type || template.type;
    const isStory = currentType === 'story';

    if (slotBadgeEl) {
      slotBadgeEl.textContent = isStory ? 'Story 24h' : 'Post Feed';
      slotBadgeEl.style.backgroundColor = `${template.color}20`;
      slotBadgeEl.style.color = template.color;
    }

    // Remplir les champs
    document.getElementById('postSemaine').value = weekStr;
    document.getElementById('postJourCible').value = template.jour_cible;
    document.getElementById('postType').value = currentType;
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
    this.updateFormatGuide(currentType);

    modal?.classList.add('active');
  },

  updateFormatGuide(type) {
    const isStory = type === 'story';
    const guideBox = document.getElementById('formatGuideBox');
    const icon = document.getElementById('formatGuideIcon');
    const title = document.getElementById('formatGuideTitle');
    const desc = document.getElementById('formatGuideDesc');
    const ratioBadge = document.getElementById('formatGuideRatioBadge');

    if (!guideBox) return;

    if (isStory) {
      guideBox.className = 'format-guide-box is-story';
      if (icon) icon.textContent = '📱';
      if (title) title.textContent = 'Format Story : 9:16 Vertical (1080 × 1920 px)';
      if (desc) desc.textContent = 'Format vertical plein écran. Laissez 15% d\'espace en haut et en bas pour que les boutons Instagram ne cachent pas votre plat.';
      if (ratioBadge) {
        ratioBadge.textContent = '9:16 Vertical';
        ratioBadge.style.backgroundColor = '#F43F5E20';
        ratioBadge.style.color = '#F43F5E';
      }
    } else {
      guideBox.className = 'format-guide-box is-post';
      if (icon) icon.textContent = '🖼️';
      if (title) title.textContent = 'Format Post Feed : 4:5 Vertical (1080 × 1350 px) ou 1:1 Carré';
      if (desc) desc.textContent = 'Le format 4:5 vertical maximise l\'attention et occupe 25% d\'espace en plus dans le fil Instagram !';
      if (ratioBadge) {
        ratioBadge.textContent = '4:5 / 1:1';
        ratioBadge.style.backgroundColor = '#FF704320';
        ratioBadge.style.color = '#FF7043';
      }
    }
  },

  suggestCaptionForCurrentSlot() {
    const contentType = document.getElementById('postTypeContenu')?.value || 'produit';
    
    // Trouver le meilleur modèle
    let template = Config.CAPTION_TEMPLATES.find(t => t.type === contentType);
    if (!template) {
      template = Config.CAPTION_TEMPLATES[0];
    }

    const legendeInput = document.getElementById('postLegende');
    const titreInput = document.getElementById('postTitre');

    if (legendeInput) {
      legendeInput.value = template.caption;
    }
    if (titreInput && (!titreInput.value.trim() || titreInput.value.includes('—'))) {
      titreInput.value = template.titleSuggestion;
    }

    this.showToast('💡 Légende captivante & hashtags insérés avec succès !');
  },

  addHashtagsToCaption() {
    const contentType = document.getElementById('postTypeContenu')?.value || 'produit';
    let pack = Config.HASHTAG_PACKS.general;
    if (contentType === 'produit') pack = Config.HASHTAG_PACKS.viandes;
    if (contentType === 'promo') pack = Config.HASHTAG_PACKS.brunch;
    if (contentType === 'evenement' || contentType === 'coulisses') pack = Config.HASHTAG_PACKS.soiree;

    const legendeInput = document.getElementById('postLegende');
    if (legendeInput) {
      if (legendeInput.value.includes('#GreyCorner')) {
        this.showToast('Les hashtags sont déjà présents dans le texte.');
        return;
      }
      legendeInput.value = (legendeInput.value.trim() + pack).trim();
      this.showToast('#️⃣ Pack de hashtags Grey Corner ajouté !');
    }
  },

  openCaptionTemplatesModal() {
    const listEl = document.getElementById('captionTemplatesList');
    if (!listEl) return;

    listEl.innerHTML = Config.CAPTION_TEMPLATES.map(tpl => {
      return `
        <div class="caption-template-card">
          <div class="template-card-header">
            <h4>${tpl.label}</h4>
            <span class="template-type-tag">${tpl.type}</span>
          </div>
          <p class="template-preview-text">${CalendarModule.escapeHtml(tpl.caption)}</p>
          <button type="button" class="btn-apply-template" data-tpl-id="${tpl.id}">
            <span>✨</span> Appliquer ce texte
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-apply-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const tplId = btn.dataset.tplId;
        const tpl = Config.CAPTION_TEMPLATES.find(t => t.id === tplId);
        if (tpl) {
          const legendeInput = document.getElementById('postLegende');
          const titreInput = document.getElementById('postTitre');
          if (legendeInput) legendeInput.value = tpl.caption;
          if (titreInput && (!titreInput.value.trim() || titreInput.value.includes('—'))) {
            titreInput.value = tpl.titleSuggestion;
          }
          if (tpl.type) {
            document.getElementById('postTypeContenu').value = tpl.type;
          }
          document.getElementById('captionTemplatesModal')?.classList.remove('active');
          this.showToast(`✨ Modèle "${tpl.label}" appliqué !`);
        }
      });
    });

    document.getElementById('captionTemplatesModal')?.classList.add('active');
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
      if (err.message && err.message.includes('posts_jour_cible_check')) {
        alert("⚠️ Contrainte Supabase non à jour :\nVotre base Supabase n'accepte pas encore Mardi, Mercredi ou Jeudi.\n\n👉 Ouvrez le SQL Editor de Supabase et exécutez :\nalter table public.posts drop constraint if exists posts_jour_cible_check;\nalter table public.posts add constraint posts_jour_cible_check check (jour_cible in ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'));");
      } else {
        alert('Erreur lors de l enregistrement : ' + (err.message || 'Vérifiez la console'));
      }
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
  },

  // ─── GESTION DE LA BANQUE DE VISUELS (RÉSERVE DE PHOTOS) ───
  async updateMediaBadge() {
    try {
      const list = await DataService.getMediaLibrary();
      const dispoCount = list.filter(m => m.statut === 'disponible').length;
      const badge = document.getElementById('mediaCountDispo');
      if (badge) badge.textContent = dispoCount;
    } catch (e) {
      console.warn('Erreur mise à jour badge média', e);
    }
  },

  async openMediaLibrary(isPicker = false) {
    this.isMediaPickerMode = isPicker;
    const notice = document.getElementById('mediaLibraryPickerNotice');
    if (notice) {
      notice.style.display = isPicker ? 'inline-block' : 'none';
      notice.textContent = isPicker ? '👉 Cliquez sur une photo pour l\'assigner au créneau' : '';
    }
    await this.renderMediaLibrary();
    document.getElementById('mediaLibraryModal')?.classList.add('active');
  },

  async renderMediaLibrary() {
    const grid = document.getElementById('mediaLibraryGrid');
    if (!grid) return;

    const list = await DataService.getMediaLibrary();

    const countAll = list.length;
    const countDispo = list.filter(m => m.statut === 'disponible').length;
    const countPublie = list.filter(m => m.statut === 'publie' || m.statut === 'planifie').length;

    if (document.getElementById('libCountAll')) document.getElementById('libCountAll').textContent = countAll;
    if (document.getElementById('libCountDispo')) document.getElementById('libCountDispo').textContent = countDispo;
    if (document.getElementById('libCountPublie')) document.getElementById('libCountPublie').textContent = countPublie;
    const badge = document.getElementById('mediaCountDispo');
    if (badge) badge.textContent = countDispo;

    const filtered = list.filter(m => {
      if (this.activeLibFilter === 'disponible') return m.statut === 'disponible';
      if (this.activeLibFilter === 'publie') return m.statut === 'publie' || m.statut === 'planifie';
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-media-msg" style="grid-column: 1/-1; text-align:center; padding: 40px 20px; color:var(--ink-faint);">
          <span style="font-size:32px;">📷</span><br>
          <strong style="color:var(--ink);">Aucune photo dans cette catégorie.</strong><br>
          Ajoutez vos photos de plats ci-dessus pour vous constituer une réserve !
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const isDispo = item.statut === 'disponible';
      const statusBadge = isDispo 
        ? `<span class="media-stat-pill dispo">🟢 Disponible</span>` 
        : `<span class="media-stat-pill used">⚪ Déjà utilisé</span>`;

      return `
        <div class="media-card ${isDispo ? 'is-available' : 'is-used'}" data-media-id="${item.id}">
          <div class="media-thumb-wrap has-lightbox" title="Cliquer pour agrandir la photo">
            <img src="${item.url}" alt="${item.titre || 'Plat'}" loading="lazy" data-lightbox="${item.url}" data-caption="${CalendarModule.escapeHtml(item.titre || 'Photo en réserve')}">
            ${statusBadge}
            <div class="media-zoom-overlay">
              <span>🔍</span>
            </div>
          </div>
          <div class="media-card-body">
            <h4 class="media-card-title">${CalendarModule.escapeHtml(item.titre || 'Plat sans titre')}</h4>
            <div class="media-card-actions">
              ${this.isMediaPickerMode ? `
                <button type="button" class="btn-use-media" data-action="pick-this">
                  <span>✨</span> Utiliser ce plat
                </button>
              ` : `
                <button type="button" class="btn-delete-media" data-action="delete-media" title="Supprimer de la réserve">
                  <span>🗑️ Supprimer</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attacher les événements
    grid.querySelectorAll('.media-card').forEach(card => {
      const mediaId = card.dataset.mediaId;
      const item = list.find(m => m.id === mediaId);
      if (!item) return;

      const btnPick = card.querySelector('[data-action="pick-this"]');
      btnPick?.addEventListener('click', () => {
        this.selectMediaForCurrentSlot(item);
      });

      const btnDel = card.querySelector('[data-action="delete-media"]');
      btnDel?.addEventListener('click', async () => {
        if (confirm(`Supprimer "${item.titre || 'cette photo'}" de votre réserve ?`)) {
          await DataService.deleteMediaItem(item.id);
          await this.renderMediaLibrary();
          await this.updateMediaBadge();
          this.showToast('Photo supprimée de la réserve.');
        }
      });
    });
  },

  selectMediaForCurrentSlot(mediaItem) {
    document.getElementById('postVisuelUrl').value = mediaItem.url;
    this.updateImagePreview(mediaItem.url);

    // Si le titre du créneau est encore vide ou par défaut, on met le nom du plat
    const titreInput = document.getElementById('postTitre');
    if ((!titreInput.value.trim() || titreInput.value.includes('—')) && mediaItem.titre) {
      titreInput.value = mediaItem.titre;
    }

    if (mediaItem.type_contenu) {
      document.getElementById('postTypeContenu').value = mediaItem.type_contenu;
    }

    // Fermer la médiathèque
    document.getElementById('mediaLibraryModal')?.classList.remove('active');
    this.showToast(`✨ Photo "${mediaItem.titre || 'Plat'}" appliquée au créneau !`);
  }
};

window.App = App;

// Lancement automatique au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
