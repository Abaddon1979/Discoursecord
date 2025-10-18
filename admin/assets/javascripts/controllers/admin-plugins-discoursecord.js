// Admin controller: Plugins -> Discoursecord (admin bundle)
import Controller from "@ember/controller";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { tracked } from "@glimmer/tracking";

export default class AdminPluginsDiscoursecordController extends Controller {
  queryParams = [];
  @tracked rankings = [];
  @tracked colors = {};
  @tracked saving = false;
  @tracked saved = false;
  @tracked error = null;

  set model(value) {
    this._model = value;
    if (value) {
      this.rankings = [...(value.rankings || [])];
      this.colors = { ...(value.colors || {}) };
    }
  }
  get model() {
    return this._model;
  }

  // Drag-and-drop support (HTML5)
  dragIndex = null;

  @action
  dragStart(idx, event) {
    this.dragIndex = idx;
    event.dataTransfer?.setData("text/plain", String(idx));
    event.dataTransfer?.setDragImage?.(event.target, 10, 10);
  }

  @action
  dragOver(_idx, event) {
    event.preventDefault();
  }

  @action
  drop(idx, event) {
    event.preventDefault();
    const from = this.dragIndex;
    if (from === null || from === undefined) return;
    if (from === idx) return;
    const arr = [...this.rankings];
    const [item] = arr.splice(from, 1);
    arr.splice(idx, 0, item);
    this.rankings = arr;
    this.dragIndex = null;
  }

  @action
  moveUp(idx) {
    if (idx <= 0) return;
    const arr = [...this.rankings];
    const [item] = arr.splice(idx, 1);
    arr.splice(idx - 1, 0, item);
    this.rankings = arr;
  }

  @action
  moveDown(idx) {
    if (idx >= this.rankings.length - 1) return;
    const arr = [...this.rankings];
    const [item] = arr.splice(idx, 1);
    arr.splice(idx + 1, 0, item);
    this.rankings = arr;
  }

  @action
  addGroup() {
    const name = prompt("Enter a group key (e.g., admin, staff, moderator, trust_level_3)");
    if (!name) return;
    const key = String(name).trim().toLowerCase().replace(/\s+/g, "_");
    if (!key) return;
    if (this.rankings.includes(key)) {
      alert("Group already in the list.");
      return;
    }
    this.rankings = [...this.rankings, key];
    if (!this.colors[key]) {
      this.colors = { ...this.colors, [key]: "#000000" };
    }
  }

  @action
  removeGroup(idx) {
    const arr = [...this.rankings];
    arr.splice(idx, 1);
    this.rankings = arr;
  }

  @action
  changeColor(key, event) {
    const value = event?.target?.value;
    if (!key || !value) return;
    this.colors = { ...this.colors, [key]: value };
  }

  @action
  async saveAll() {
    this.saving = true;
    this.saved = false;
    this.error = null;
    try {
      const rankingsValue = this.rankings.join(",");
      await ajax("/admin/site_settings/discoursecord_group_rankings", {
        type: "PUT",
        data: { value: rankingsValue },
      });

      const colorsValue = JSON.stringify(this.colors);
      await ajax("/admin/site_settings/discoursecord_group_colors", {
        type: "PUT",
        data: { value: colorsValue },
      });

      this.saved = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed saving Discoursecord settings", e);
      this.error = "Failed to save settings. Check logs and try again.";
    } finally {
      this.saving = false;
      setTimeout(() => (this.saved = false), 3000);
    }
  }
}
