import DiscourseRoute from "discourse/routes/discourse";

export default DiscourseRoute.extend({
  model() {
    return this.store.find("site");
  },

  setupController(controller, model) {
    controller.setProperties({
      groupRankings: this.siteSettings.discoursecord_group_rankings?.split(",") || [],
      groupColors: JSON.parse(this.siteSettings.discoursecord_group_colors || "{}"),
      saving: false
    });
  }
});
