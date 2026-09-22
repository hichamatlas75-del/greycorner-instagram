/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Dashboard de Synthèse & Calculs des KPIs (js/dashboard.js)
 * ==============================================================================
 */

const DashboardModule = {
  async render() {
    const currentWeek = CalendarModule?.currentWeekStr || DateUtils.getIsoWeekString();
    
    // Récupérer les posts de la semaine courante et l'ensemble de l'historique
    const weekPosts = await DataService.getPostsForWeek(currentWeek);
    const allPosts = await DataService.getAllPosts();

    this.renderRhythmRate(weekPosts);
    this.renderStoriesVsPostEngagement(weekPosts);
    this.renderBestStoryDay(allPosts, currentWeek);
    this.renderContentTypeRanking(allPosts);
  },

  /**
   * KPI 1 : Taux de respect du rythme (créneaux tenus / 4 cette semaine)
   */
  renderRhythmRate(weekPosts) {
    const totalSlots = 4;
    const publishedCount = weekPosts.filter(p => p.statut === 'publie').length;
    const percentage = Math.round((publishedCount / totalSlots) * 100);

    const valEl = document.getElementById('kpiRhythmValue');
    const subEl = document.getElementById('kpiRhythmSub');
    const barEl = document.getElementById('kpiRhythmBar');

    if (valEl) {
      valEl.innerHTML = `${percentage}% <span class="kpi-fraction">(${publishedCount}/${totalSlots})</span>`;
    }
    if (subEl) {
      if (publishedCount === 4) {
        subEl.textContent = '🎉 Rythme 100% respecté cette semaine !';
        subEl.style.color = 'var(--success)';
      } else if (publishedCount >= 2) {
        subEl.textContent = `En bonne voie (${4 - publishedCount} restant${4 - publishedCount > 1 ? 's' : ''})`;
        subEl.style.color = 'var(--ochre)';
      } else {
        subEl.textContent = `Attention au rythme (${4 - publishedCount} créneaux à publier)`;
        subEl.style.color = 'var(--ink-faint)';
      }
    }
    if (barEl) {
      barEl.style.width = `${percentage}%`;
      barEl.style.backgroundColor = percentage === 100 ? 'var(--teal)' : 'var(--ochre)';
    }
  },

  /**
   * KPI 2 : Vues moyennes stories vs engagement du post du lundi
   */
  renderStoriesVsPostEngagement(weekPosts) {
    const postLundi = weekPosts.find(p => p.jour_cible === 'lundi' && p.type === 'post');
    const stories = weekPosts.filter(p => p.type === 'story' && p.statut === 'publie');

    // Vues moyennes des stories publiées
    let totalStoryViews = 0;
    let storiesCount = 0;
    stories.forEach(s => {
      if (s.vues && s.vues > 0) {
        totalStoryViews += s.vues;
        storiesCount++;
      }
    });
    const avgStoryViews = storiesCount > 0 ? Math.round(totalStoryViews / storiesCount) : 0;

    // Engagement post du lundi (likes + commentaires + partages)
    let postEngagement = 0;
    let postLikes = 0;
    let postComms = 0;
    let postShares = 0;
    let postViews = 0;

    if (postLundi && postLundi.statut === 'publie') {
      postLikes = postLundi.likes || 0;
      postComms = postLundi.commentaires || 0;
      postShares = postLundi.partages || 0;
      postViews = postLundi.vues || 0;
      postEngagement = postLikes + postComms + postShares;
    }

    const containerEl = document.getElementById('kpiComparisonContainer');
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="kpi-compare-grid">
        <div class="compare-card stories">
          <div class="compare-header">
            <span class="compare-icon">📱</span>
            <span class="compare-tag">Stories (Ven-Sam-Dim)</span>
          </div>
          <div class="compare-main-stat">
            <span class="compare-number">${avgStoryViews.toLocaleString('fr-FR')}</span>
            <span class="compare-unit">vues moyennes</span>
          </div>
          <div class="compare-details">
            <span>${storiesCount} story${storiesCount > 1 ? 's' : ''} publiée${storiesCount > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div class="compare-divider">VS</div>

        <div class="compare-card post">
          <div class="compare-header">
            <span class="compare-icon">🖼️</span>
            <span class="compare-tag">Post Lundi (Feed)</span>
          </div>
          <div class="compare-main-stat">
            <span class="compare-number">${postEngagement.toLocaleString('fr-FR')}</span>
            <span class="compare-unit">engagements totaux</span>
          </div>
          <div class="compare-details">
            <span>❤️ ${postLikes}</span>
            <span>💬 ${postComms}</span>
            <span>↗️ ${postShares}</span>
            <span class="views-hint">(${postViews.toLocaleString('fr-FR')} vues)</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * KPI 3 : Meilleur jour de story sur les 4 dernières semaines
   */
  renderBestStoryDay(allPosts, currentWeek) {
    // Calculer les 4 dernières semaines à partir de currentWeek
    const targetWeeks = [
      currentWeek,
      DateUtils.shiftWeek(currentWeek, -1),
      DateUtils.shiftWeek(currentWeek, -2),
      DateUtils.shiftWeek(currentWeek, -3)
    ];

    const storiesRecent = allPosts.filter(p => 
      p.type === 'story' && 
      p.statut === 'publie' && 
      targetWeeks.includes(p.semaine) &&
      p.vues > 0
    );

    const statsByDay = {
      vendredi: { label: 'Vendredi', totalViews: 0, count: 0, color: '#f43f5e' },
      samedi: { label: 'Samedi', totalViews: 0, count: 0, color: '#f59e0b' },
      dimanche: { label: 'Dimanche', totalViews: 0, count: 0, color: '#06b6d4' }
    };

    storiesRecent.forEach(s => {
      if (statsByDay[s.jour_cible]) {
        statsByDay[s.jour_cible].totalViews += s.vues;
        statsByDay[s.jour_cible].count += 1;
      }
    });

    const dayAverages = Object.entries(statsByDay).map(([dayKey, data]) => {
      const avg = data.count > 0 ? Math.round(data.totalViews / data.count) : 0;
      return { dayKey, ...data, avg };
    });

    // Trier par moyenne décroissante
    dayAverages.sort((a, b) => b.avg - a.avg);

    const bestDay = dayAverages[0];
    const maxAvg = Math.max(...dayAverages.map(d => d.avg), 1);

    const containerEl = document.getElementById('kpiBestDayContainer');
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="best-day-header">
        <span class="trophy-badge">🏆 Meilleur jour : <strong>${bestDay.count > 0 ? bestDay.label : 'Pas assez de données'}</strong></span>
        <span class="best-day-stat">${bestDay.count > 0 ? `${bestDay.avg.toLocaleString('fr-FR')} vues moy.` : ''}</span>
      </div>
      <div class="day-bars-list">
        ${dayAverages.map(d => {
          const pct = Math.round((d.avg / maxAvg) * 100);
          return `
            <div class="day-bar-row">
              <div class="day-name">${d.label}</div>
              <div class="day-bar-track">
                <div class="day-bar-fill" style="width: ${pct}%; background-color: ${d.color};"></div>
              </div>
              <div class="day-bar-value">${d.avg > 0 ? d.avg.toLocaleString('fr-FR') : '-'}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * KPI 4 : Classement des posts par type de contenu (produit / coulisses / promo / événement)
   */
  renderContentTypeRanking(allPosts) {
    const published = allPosts.filter(p => p.statut === 'publie');

    const types = {
      produit: { ...Config.CONTENT_TYPES.produit, count: 0, totalScore: 0 },
      coulisses: { ...Config.CONTENT_TYPES.coulisses, count: 0, totalScore: 0 },
      promo: { ...Config.CONTENT_TYPES.promo, count: 0, totalScore: 0 },
      evenement: { ...Config.CONTENT_TYPES.evenement, count: 0, totalScore: 0 }
    };

    published.forEach(p => {
      const typeKey = p.type_contenu || 'produit';
      if (types[typeKey]) {
        types[typeKey].count += 1;
        // Score = Vues + Likes*3 + Commentaires*5 + Partages*4
        const score = (p.vues || 0) + ((p.likes || 0) * 3) + ((p.commentaires || 0) * 5) + ((p.partages || 0) * 4);
        types[typeKey].totalScore += score;
      }
    });

    const ranking = Object.entries(types).map(([key, item]) => {
      const avgScore = item.count > 0 ? Math.round(item.totalScore / item.count) : 0;
      return { key, ...item, avgScore };
    });

    ranking.sort((a, b) => b.avgScore - a.avgScore);
    const maxScore = Math.max(...ranking.map(r => r.avgScore), 1);

    const containerEl = document.getElementById('kpiContentRankingContainer');
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="ranking-list">
        ${ranking.map((item, index) => {
          const pct = Math.round((item.avgScore / maxScore) * 100);
          return `
            <div class="ranking-item">
              <div class="rank-pos">#${index + 1}</div>
              <div class="rank-icon">${item.icon}</div>
              <div class="rank-info">
                <div class="rank-title-row">
                  <span class="rank-name">${item.label}</span>
                  <span class="rank-count">(${item.count} publ.)</span>
                </div>
                <div class="rank-bar-track">
                  <div class="rank-bar-fill" style="width: ${pct}%; background-color: ${item.color};"></div>
                </div>
              </div>
              <div class="rank-score">
                <strong>${item.avgScore.toLocaleString('fr-FR')}</strong>
                <span class="score-label">pts</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};

window.DashboardModule = DashboardModule;
