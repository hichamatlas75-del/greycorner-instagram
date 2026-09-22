/**
 * ==============================================================================
 * MODULE RÉSEAUX SOCIAUX — GREY CORNER
 * Utilitaires de gestion des dates & semaines ISO 8601 (js/date-utils.js)
 * ==============================================================================
 */

const DateUtils = {
  /**
   * Retourne la semaine ISO 8601 pour une date donnée (ex: "2026-W39")
   */
  getIsoWeekString(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  },

  /**
   * Décompose une chaîne ISO "YYYY-Www"
   */
  parseIsoWeek(weekStr) {
    const parts = weekStr.split('-W');
    if (parts.length !== 2) {
      const nowWeek = this.getIsoWeekString();
      return this.parseIsoWeek(nowWeek);
    }
    return {
      year: parseInt(parts[0], 10),
      week: parseInt(parts[1], 10)
    };
  },

  /**
   * Décale une semaine ISO par un offset (-1 pour précédente, +1 pour suivante)
   */
  shiftWeek(weekStr, offset = 0) {
    const { year, week } = this.parseIsoWeek(weekStr);
    // Trouver le lundi de la semaine
    const monday = this.getMondayOfWeek(year, week);
    monday.setDate(monday.getDate() + (offset * 7));
    return this.getIsoWeekString(monday);
  },

  /**
   * Calcule le lundi d'une semaine ISO
   */
  getMondayOfWeek(year, week) {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dayOfWeek = simple.getUTCDay();
    const ISOweekStart = simple;
    if (dayOfWeek <= 4) {
      ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    } else {
      ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    }
    return new Date(ISOweekStart.getUTCFullYear(), ISOweekStart.getUTCMonth(), ISOweekStart.getUTCDate());
  },

  /**
   * Retourne un dictionnaire des dates réelles des 4 créneaux fixes pour une semaine donnée
   */
  getSlotDates(weekStr) {
    const { year, week } = this.parseIsoWeek(weekStr);
    const monday = this.getMondayOfWeek(year, week);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      lundi: monday,
      vendredi: friday,
      samedi: saturday,
      dimanche: sunday
    };
  },

  /**
   * Formate une date courte en français (ex: "21 Sept.")
   */
  formatShortFr(date) {
    if (!date) return '';
    const d = new Date(date);
    const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  },

  /**
   * Formate une date complète (ex: "Lundi 21 Septembre 2026")
   */
  formatFullFr(date) {
    if (!date) return '';
    const d = new Date(date);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /**
   * Retourne le nom du jour courant en français
   */
  getCurrentDayFr() {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return days[new Date().getDay()];
  }
};

window.DateUtils = DateUtils;
