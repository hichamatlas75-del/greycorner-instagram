/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Gestion du Calendrier Hebdomadaire (js/calendar.js)
 * ==============================================================================
 */

const CalendarModule = {
  currentWeekStr: '',

  init(initialWeek) {
    this.currentWeekStr = initialWeek || DateUtils.getIsoWeekString();
    this.bindEvents();
  },

  bindEvents() {
    // Boutons de navigation par semaine
    document.getElementById('btnPrevWeek')?.addEventListener('click', () => {
      this.navigateWeek(-1);
    });

    document.getElementById('btnNextWeek')?.addEventListener('click', () => {
      this.navigateWeek(1);
    });

    document.getElementById('btnCurrentWeek')?.addEventListener('click', () => {
      this.currentWeekStr = DateUtils.getIsoWeekString();
      this.render();
    });

    // Bouton de pré-remplissage automatique
    document.getElementById('btnPrefillWeek')?.addEventListener('click', async () => {
      await DataService.autoPrefillWeek(this.currentWeekStr);
      await this.render();
      window.DashboardModule?.render();
      App.showToast('4 créneaux pré-remplis avec succès (statut Idée) !');
    });
  },

  async navigateWeek(offset) {
    this.currentWeekStr = DateUtils.shiftWeek(this.currentWeekStr, offset);
    await this.render();
    window.DashboardModule?.render();
  },

  async render() {
    const weekLabelEl = document.getElementById('currentWeekLabel');
    const weekSubEl = document.getElementById('currentWeekSub');
    const gridEl = document.getElementById('calendarGrid');
    const prefillBannerEl = document.getElementById('prefillPrompt');

    if (!gridEl) return;

    // Affichage de l'en-tête de semaine
    const { year, week } = DateUtils.parseIsoWeek(this.currentWeekStr);
    const slotDates = DateUtils.getSlotDates(this.currentWeekStr);
    
    if (weekLabelEl) {
      weekLabelEl.textContent = `Semaine ${week} • ${year}`;
    }
    if (weekSubEl) {
      const startStr = DateUtils.formatShortFr(slotDates.lundi);
      const endStr = DateUtils.formatShortFr(slotDates.dimanche);
      const isCurrent = this.currentWeekStr === DateUtils.getIsoWeekString();
      weekSubEl.innerHTML = `<span>${startStr} — ${endStr}</span> ${isCurrent ? '<span class="pill-current-week">Semaine en cours</span>' : ''}`;
    }

    // Récupération des posts pour cette semaine
    const posts = await DataService.getPostsForWeek(this.currentWeekStr);

    // Vérifier si des créneaux manquent
    const existingSlots = new Set(posts.map(p => `${p.jour_cible}_${p.type}`));
    const hasMissingSlots = Config.WEEKLY_TEMPLATE.some(t => !existingSlots.has(`${t.jour_cible}_${t.type}`));

    if (prefillBannerEl) {
      prefillBannerEl.style.display = hasMissingSlots ? 'flex' : 'none';
    }

    // Vider et générer la grille des 4 créneaux
    gridEl.innerHTML = '';

    for (const template of Config.WEEKLY_TEMPLATE) {
      const post = posts.find(p => p.jour_cible === template.jour_cible && p.type === template.type);
      const dateObj = slotDates[template.jour_cible];
      const dateFormatted = DateUtils.formatShortFr(dateObj);
      const card = this.createSlotCard(template, dateFormatted, post);
      gridEl.appendChild(card);
    }
  },

  createSlotCard(template, dateFormatted, post) {
    const card = document.createElement('div');
    card.className = `slot-card ${template.jour_cible}`;

    const isStory = template.type === 'story';
    const statusKey = post?.statut || 'vide';
    const statusCfg = Config.STATUSES[statusKey] || { label: 'Non défini', icon: '⚪', class: 'status-empty' };
    const contentTypeKey = post?.type_contenu || template.defaultContent;
    const contentTypeCfg = Config.CONTENT_TYPES[contentTypeKey] || Config.CONTENT_TYPES.produit;

    // Alerte expiration story 24h si publiée mais 0 vue
    const needsStoryMetricsAlert = isStory && post?.statut === 'publie' && (!post.vues || post.vues === 0);

    const hasImage = post?.visuel_url && post.visuel_url.trim() !== '';

    card.innerHTML = `
      <div class="slot-header" style="border-left-color: ${template.color}">
        <div class="slot-meta">
          <span class="slot-tag" style="background-color: ${template.color}15; color: ${template.color}; border: 1px solid ${template.color}35;">
            ${template.tag}
          </span>
          <span class="slot-date">${dateFormatted}</span>
        </div>
        <div class="slot-title-row">
          <h3 class="slot-day-title">${template.label}</h3>
          <button class="status-badge ${statusCfg.class}" title="Cliquer pour changer le statut" data-action="toggle-status">
            ${statusCfg.icon} ${statusCfg.label}
          </button>
        </div>
        <p class="slot-theme-guide">${template.description}</p>
      </div>

      <div class="slot-visual-container">
        ${hasImage 
          ? `<img src="${post.visuel_url}" alt="Visuel" class="slot-thumb" loading="lazy" />` 
          : `<div class="slot-thumb-placeholder">
               <span class="placeholder-icon">📸</span>
               <span class="placeholder-text">${post ? 'Aucun visuel joint' : 'Créneau non initialisé'}</span>
             </div>`
        }
      </div>

      <div class="slot-details">
        <div class="slot-content-type">
          <span class="type-pill" style="border-color: ${contentTypeCfg.color}40; color: ${contentTypeCfg.color}; background: ${contentTypeCfg.color}10;">
            ${contentTypeCfg.icon} ${contentTypeCfg.label}
          </span>
        </div>

        ${post?.titre ? `<div class="slot-post-title">${this.escapeHtml(post.titre)}</div>` : ''}

        ${needsStoryMetricsAlert ? `
          <div class="story-alert-banner">
            <span class="alert-icon">⚠️</span>
            <div class="alert-msg">
              <strong>Expire bientôt (24h) !</strong><br>
              Relevez les vues avant ce soir.
            </div>
          </div>
        ` : ''}

        ${post?.statut === 'publie' ? `
          <div class="slot-metrics-preview">
            <div class="metric-item" title="Nombre de vues">
              <span class="m-icon">👁️</span>
              <span class="m-val">${post.vues || 0}</span>
            </div>
            ${!isStory ? `
              <div class="metric-item" title="Likes">
                <span class="m-icon">❤️</span>
                <span class="m-val">${post.likes || 0}</span>
              </div>
              <div class="metric-item" title="Commentaires">
                <span class="m-icon">💬</span>
                <span class="m-val">${post.commentaires || 0}</span>
              </div>
              <div class="metric-item" title="Partages">
                <span class="m-icon">↗️</span>
                <span class="m-val">${post.partages || 0}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <div class="slot-footer">
        <button class="btn-slot-action primary" data-action="edit">
          <span>✏️</span> ${post ? 'Éditer / Stats' : 'Créer ce créneau'}
        </button>
        ${post ? `
          <button class="btn-slot-action danger" data-action="delete" title="Supprimer">
            <span>🗑️</span>
          </button>
        ` : ''}
      </div>
    `;

    // Gestionnaires d'événements sur la carte
    const btnEdit = card.querySelector('[data-action="edit"]');
    btnEdit?.addEventListener('click', () => {
      App.openEditModal(template, this.currentWeekStr, post);
    });

    const btnDelete = card.querySelector('[data-action="delete"]');
    btnDelete?.addEventListener('click', async () => {
      if (confirm(`Voulez-vous supprimer ce créneau (${template.label}) ?`)) {
        await DataService.deletePost(post.id);
        await this.render();
        window.DashboardModule?.render();
        App.showToast('Créneau supprimé.');
      }
    });

    const btnStatus = card.querySelector('[data-action="toggle-status"]');
    btnStatus?.addEventListener('click', async () => {
      if (!post) {
        App.openEditModal(template, this.currentWeekStr, null);
        return;
      }
      // Cycle des statuts : idee -> planifie -> publie -> idee
      const nextStatus = post.statut === 'idee' ? 'planifie' : (post.statut === 'planifie' ? 'publie' : 'idee');
      post.statut = nextStatus;
      if (nextStatus === 'publie' && !post.date_publication_reelle) {
        post.date_publication_reelle = new Date().toISOString();
      }
      await DataService.upsertPost(post);
      await this.render();
      window.DashboardModule?.render();
      App.showToast(`Statut mis à jour : ${Config.STATUSES[nextStatus].label}`);
    });

    return card;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
};

window.CalendarModule = CalendarModule;
