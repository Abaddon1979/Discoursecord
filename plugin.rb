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
add_admin_route 'Discoursecord', 'discoursecord'

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
