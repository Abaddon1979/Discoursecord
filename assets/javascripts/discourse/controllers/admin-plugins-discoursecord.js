import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class AdminPluginsDiscoursecordController extends Controller {
  @service siteSettings;

  groupRankings = [];
  groupColors = {};
  saving = false;

  @action
  moveGroupUp(index) {
    if (index > 0) {
      const rankings = [...this.groupRankings];
      [rankings[index - 1], rankings[index]] = [rankings[index], rankings[index - 1]];
      this.set("groupRankings", rankings);
    }
  }

  @action
  moveGroupDown(index) {
    if (index < this.groupRankings.length - 1) {
      const rankings = [...this.groupRankings];
      [rankings[index], rankings[index + 1]] = [rankings[index + 1], rankings[index]];
      this.set("groupRankings", rankings);
    }
  }

  @action
  updateGroupColor(group, color) {
    const colors = { ...this.groupColors };
    colors[group] = color;
    this.set("groupColors", colors);
  }

  @action
  async saveSettings() {
    this.set("saving", true);

    try {
      // Update the site settings
      await this.siteSettings.setProperties({
        discoursecord_group_rankings: this.groupRankings.join(","),
        discoursecord_group_colors: JSON.stringify(this.groupColors)
      });

      // Save the settings
      await this.siteSettings.save();

      // Show success message
      this.appEvents.trigger("modal-body:flash", {
        message: "Settings saved successfully",
        class: "success"
      });
    } catch (error) {
      // Show error message
      this.appEvents.trigger("modal-body:flash", {
        message: "Failed to save settings",
        class: "error"
      });
    } finally {
      this.set("saving", false);
    }
  }

  @action
  addNewGroup() {
    const newGroup = prompt("Enter the name of the new group:");
    if (newGroup && newGroup.trim() && !this.groupRankings.includes(newGroup.trim())) {
      this.set("groupRankings", [...this.groupRankings, newGroup.trim()]);
      this.set("groupColors", {
        ...this.groupColors,
        [newGroup.trim()]: "#000000"
      });
    }
  }

  @action
  removeGroup(group) {
    if (confirm(`Are you sure you want to remove the group "${group}"?`)) {
      const rankings = this.groupRankings.filter(g => g !== group);
      const colors = { ...this.groupColors };
      delete colors[group];
      
      this.set("groupRankings", rankings);
      this.set("groupColors", colors);
    }
  }
}
