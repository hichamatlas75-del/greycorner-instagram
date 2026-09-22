// ==============================================================================
// SUPABASE EDGE FUNCTION : reminder-story-expiration
// Module Réseaux Sociaux — Grey Corner
// Rappel automatique pour le relevé des vues stories avant expiration 24h
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const webhookUrl = Deno.env.get("NOTIFICATION_WEBHOOK_URL"); // Optionnel : Telegram, Discord, etc.

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables d'environnement Supabase manquantes.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Déterminer le jour de la semaine actuel
    const now = new Date();
    const dayOfWeekIndex = now.getDay(); // 0 = Dimanche, 5 = Vendredi, 6 = Samedi
    const dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const currentDay = dayNames[dayOfWeekIndex];

    console.log(`[Rappel Story] Exécution le ${currentDay} à ${now.toISOString()}`);

    // Si nous sommes vendredi, samedi ou dimanche
    if (["vendredi", "samedi", "dimanche"].includes(currentDay)) {
      // Rechercher les stories publiées du jour sans relevé de vues
      const { data: stories, error } = await supabase
        .from("posts")
        .select("id, jour_cible, semaine, type_contenu, visuel_url, vues, statut")
        .eq("type", "story")
        .eq("jour_cible", currentDay)
        .eq("statut", "publie")
        .or("vues.is.null,vues.eq.0");

      if (error) throw error;

      const count = stories?.length || 0;
      console.log(`[Rappel Story] ${count} stories nécessitent un relevé de vues.`);

      let notificationSent = false;

      if (count > 0 && webhookUrl) {
        // Envoi d'une alerte Webhook (par ex. vers Telegram ou Discord de l'équipe Grey Corner)
        const message = {
          content: `🚨 **Rappel Grey Corner — Expiration Stories Instagram (24h)**\n` +
            `Attention ! La story du **${currentDay.toUpperCase()}** expire dans quelques heures.\n` +
            `👉 Pensez à relever le nombre de vues sur l'application Instagram et à l'enregistrer dans le Hub !`,
          stories_count: count,
          timestamp: now.toISOString()
        };

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message)
        });

        notificationSent = res.ok;
      }

      return new Response(
        JSON.stringify({
          success: true,
          jour: currentDay,
          stories_en_attente: stories,
          notification_envoyee: notificationSent,
          message: `${count} stories trouvées nécessitant une saisie des vues.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Aujourd'hui (${currentDay}) n'est pas un jour de story Instagram pour Grey Corner.`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Erreur Edge Function]", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
