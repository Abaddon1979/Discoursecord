# frozen_string_literal: true
# name: Discoursecord
# about: Injects user groups into HTML elements with customizable colors and ranking
# version: 0.1.0
# authors: Your Name
# url: https://github.com/Abaddon1979/Discoursecord
# required_version: 2.7.0

register_asset 'stylesheets/user-groups-injector.scss'

enabled_site_setting :discoursecord_enabled

# Admin UI entry under Plugins -> Discoursecord
add_admin_route 'discoursecord', 'discoursecord'

# Custom site settings type for enhanced UI
if defined?(SiteSetting::TYPE_TYPES)
  SiteSetting.register_type_types("discoursecord_list", "Enhanced UI for group rankings")
  SiteSetting.register_type_types("discoursecord_colors", "Enhanced UI for group colors")
end

# Register custom field types for the enhanced interface
SiteSetting.register_type("discoursecord_group_rankings", "discoursecord_list")
SiteSetting.register_type("discoursecord_group_colors", "discoursecord_colors")

# Override the render method for these settings to show enhanced interface
module ::SiteSettingExtension
  def renderer_for(name, value)
    if name == "discoursecord_group_rankings" || name == "discoursecord_group_colors"
      return lambda do |setting|
        <<~HTML
          <div class="discoursecord-enhanced-ui">
            <p>This setting uses the enhanced admin interface with up/down arrows and color pickers.</p>
            <a href="/admin/plugins/discoursecord/settings" class="btn btn-primary" target="_blank">
              Configure Groups & Colors
            </a>
            <p><small>Use the enhanced interface for visual management with up/down arrows for ranking and interactive color pickers.</small></p>
          </div>
        HTML
      end
    end
    super(name, value)
  end
end

after_initialize do
  # Add user groups to serialized user data
  add_to_serializer(:basic_user, :user_groups) do
    groups =
      if object.respond_to?(:groups)
        object.groups.pluck(:name)
      else
        []
      end

    # Ensure trust level group is included (e.g., trust_level_1)
    if object.respond_to?(:trust_level) && !object.trust_level.nil?
      groups << "trust_level_#{object.trust_level}"
    end

    groups.map { |n| n.to_s.downcase }.uniq
  end

  # Also add to full User serializer (used by /u/:username.json)
  add_to_serializer(:user, :user_groups) do
    groups =
      if object.respond_to?(:groups)
        object.groups.pluck(:name)
      else
        []
      end

    # Ensure trust level group is included (e.g., trust_level_1)
    if object.respond_to?(:trust_level) && !object.trust_level.nil?
      groups << "trust_level_#{object.trust_level}"
    end

    groups.map { |n| n.to_s.downcase }.uniq
  end


  # Add highest ranked group for coloring
  add_to_serializer(:basic_user, :highest_ranked_group) do
    groups =
      if object.respond_to?(:groups)
        object.groups.pluck(:name).map { |n| n.to_s.downcase }
      else
        []
      end

    # Normalize group names (admins -> admin, moderators -> moderator)
    groups = groups.map do |g|
      case g
      when "admins" then "admin"
      when "moderators" then "moderator"
      else g
      end
    end

    rankings_raw = SiteSetting.discoursecord_group_rankings
    rankings =
      if rankings_raw.is_a?(Array)
        rankings_raw.map { |r| r.to_s.downcase }
      else
        rankings_raw.to_s.split(",").map { |r| r.strip.downcase }
      end

    groups.min_by { |g| (idx = rankings.index(g)) ? idx : Float::INFINITY }
  end

  add_to_serializer(:user, :highest_ranked_group) do
    groups =
      if object.respond_to?(:groups)
        object.groups.pluck(:name).map { |n| n.to_s.downcase }
      else
        []
      end

    # Normalize group names (admins -> admin, moderators -> moderator)
    groups = groups.map do |g|
      case g
      when "admins" then "admin"
      when "moderators" then "moderator"
      else g
      end
    end

    rankings_raw = SiteSetting.discoursecord_group_rankings
    rankings =
      if rankings_raw.is_a?(Array)
        rankings_raw.map { |r| r.to_s.downcase }
      else
        rankings_raw.to_s.split(",").map { |r| r.strip.downcase }
      end

    groups.min_by { |g| (idx = rankings.index(g)) ? idx : Float::INFINITY }
  end


  # Add group colors to serializer
  add_to_serializer(:basic_user, :group_color) do
    highest_group = highest_ranked_group
    if highest_group
      colors_raw = SiteSetting.discoursecord_group_colors
      colors =
        if colors_raw.is_a?(Hash)
          colors_raw
        else
          begin
            JSON.parse(colors_raw)
          rescue
            {}
          end
        end
      colors[highest_group] || "#000000"
    else
      nil
    end
  end

  add_to_serializer(:user, :group_color) do
    highest_group = highest_ranked_group
    if highest_group
      colors_raw = SiteSetting.discoursecord_group_colors
      colors =
        if colors_raw.is_a?(Hash)
          colors_raw
        else
          begin
            JSON.parse(colors_raw)
          rescue
            {}
          end
        end
      colors[highest_group] || "#000000"
    else
      nil
    end
  end

end
