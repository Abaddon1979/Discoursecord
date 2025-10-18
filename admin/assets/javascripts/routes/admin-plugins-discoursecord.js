// Admin route: Plugins -> Discoursecord (admin bundle)
import Route from "@ember/routing/route";
import { ajax } from "discourse/lib/ajax";

export default class AdminPluginsDiscoursecordRoute extends Route {
  renderTemplate() {
    this.render("admin/plugins/discoursecord", { into: "adminPlugins" });
  }
  async model() {
    // Load current plugin settings from the plugins category
    // Fallbacks are provided if settings are not yet customized
    const data = await ajax("/admin/site_settings/category/discoursecord.json");
    const findSetting = (name) =>
      (data.site_settings || []).find((s) => s.setting === name);

    let rankingsRaw =
      (findSetting("discoursecord_group_rankings") || {}).value || "";
    let colorsRaw =
      (findSetting("discoursecord_group_colors") || {}).value || "{}";

    let rankings = [];
    if (Array.isArray(rankingsRaw)) {
      rankings = rankingsRaw;
    } else {
      rankings = String(rankingsRaw)
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
    }

    let colors = {};
    try {
      colors = typeof colorsRaw === "object" ? colorsRaw : JSON.parse(colorsRaw);
    } catch {
      colors = {};
    }

    // Ensure there is at least a reasonable default ordering if empty
    if (rankings.length === 0) {
      rankings = [
        "admin",
        "staff",
        "moderator",
        "trust_level_4",
        "trust_level_3",
        "trust_level_2",
        "trust_level_1",
        "trust_level_0",
      ];
    }

    // Ensure there is a color for each known group (defaults can be customized later)
    const defaultColors = {
      admin: "#e74c3c",
      staff: "#f39c12",
      moderator: "#3498db",
      trust_level_4: "#8e44ad",
      trust_level_3: "#27ae60",
      trust_level_2: "#16a085",
      trust_level_1: "#7f8c8d",
      trust_level_0: "#95a5a6",
    };
    rankings.forEach((g) => {
      const key = String(g || "").toLowerCase();
      if (!colors[key]) {
        colors[key] = defaultColors[key] || "#000000";
      }
    });

    return { rankings, colors };
  }
}
