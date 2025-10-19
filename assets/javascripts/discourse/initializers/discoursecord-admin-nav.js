import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "discoursecord-admin-nav",
  initialize() {
    // Ensure a visible Admin > Plugins nav link to the custom page
    withPluginApi("0.8.7", (api) => {
      // Add a left sidebar entry that points to our custom admin page
      // This accepts a label and either a route name or absolute path.
      // Using absolute path is robust across Discourse versions.
      api.addAdminRoute("Discoursecord", "/admin/plugins/discoursecord");
    });
  },
};
