# frozen_string_literal: true
# name: Discoursecord
# about: Injects user groups into HTML elements with customizable colors and ranking
# version: 0.1.0
# authors: Your Name
# url: https://github.com/Abaddon1979/Discoursecord
# required_version: 2.7.0

enabled_site_setting :discoursecord_enabled

after_initialize do
  # Load the plugin's JavaScript and CSS
  register_asset 'stylesheets/user-groups-injector.scss'
  
  # Add user groups to serialized user data
  add_to_serializer(:basic_user, :user_groups) do
    object.groups.pluck(:name).map(&:downcase)
  end

  # Add user groups to chat message serializer
  add_to_serializer(:chat_message, :user_groups) do
    if object.user
      object.user.groups.pluck(:name).map(&:downcase)
    else
      []
    end
  end

  # Add highest ranked group for coloring
  add_to_serializer(:basic_user, :highest_ranked_group) do
    groups = object.groups.pluck(:name).map(&:downcase)
    rankings = SiteSetting.discoursecord_group_rankings || []
    
    groups.sort_by { |group| rankings.index(group) || Float::INFINITY }.first
  end

  add_to_serializer(:chat_message, :highest_ranked_group) do
    if object.user
      groups = object.user.groups.pluck(:name).map(&:downcase)
      rankings = SiteSetting.discoursecord_group_rankings || []
      
      groups.sort_by { |group| rankings.index(group) || Float::INFINITY }.first
    else
      nil
    end
  end

  # Add group colors to serializer
  add_to_serializer(:basic_user, :group_color) do
    highest_group = highest_ranked_group
    if highest_group
      colors = SiteSetting.discoursecord_group_colors || {}
      colors[highest_group] || '#000000'
    else
      nil
    end
  end

  add_to_serializer(:chat_message, :group_color) do
    highest_group = highest_ranked_group
    if highest_group
      colors = SiteSetting.discoursecord_group_colors || {}
      colors[highest_group] || '#000000'
    else
      nil
    end
  end
end
