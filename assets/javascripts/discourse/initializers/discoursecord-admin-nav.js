export default {
  name: "discoursecord-admin-nav",
  initialize() {
    // no-op: Admin → Plugins → Discoursecord link is provided by add_admin_route in plugin.rb
    // Keeping this initializer minimal avoids runtime errors on API shape changes.
  },
};
