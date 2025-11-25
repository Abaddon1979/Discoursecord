# frozen_string_literal: true

module Jobs
  class BuildDiscoursecordCache < ::Jobs::Scheduled
    every 6.hours

    def execute(args)
      return unless SiteSetting.discoursecord_enabled

      Rails.logger.info "Discoursecord: Building user cache..."

      cache_data = {
        users: {},
        generated_at: Time.now.to_i
      }

      # Fetch all active users
      User.real.where(active: true).find_each do |user|
        # Get user groups
        groups = user.groups.pluck(:name).map(&:downcase)
        
        # Add trust level
        groups << "trust_level_#{user.trust_level}" if user.trust_level

        # Normalize group names
        groups = groups.map do |g|
          case g
          when "admins" then "admin"
          when "moderators" then "moderator"
          else g
          end
        end

        # Get highest ranked group
        rankings_raw = SiteSetting.discoursecord_group_rankings
        rankings = if rankings_raw.is_a?(Array)
          rankings_raw.map(&:downcase)
        else
          rankings_raw.to_s.split(",").map { |r| r.strip.downcase }
        end

        highest_group = groups.min_by { |g| (idx = rankings.index(g)) ? idx : Float::INFINITY }

        # Get color for highest group
        color = nil
        if highest_group
          colors_raw = SiteSetting.discoursecord_group_colors
          colors = if colors_raw.is_a?(Hash)
            colors_raw
          else
            begin
              JSON.parse(colors_raw)
            rescue
              {}
            end
          end
          color = colors[highest_group] || "#000000"
        end

        # Store in cache
        cache_data[:users][user.username.downcase] = {
          user_groups: groups.uniq,
          group_color: color
        }
      end

      # Write to file
      cache_path = File.join(Rails.root, 'plugins', 'Discoursecord', 'user-cache.json')
      
      begin
        File.write(cache_path, cache_data.to_json)
        Rails.logger.info "Discoursecord: Cache built successfully with #{cache_data[:users].size} users"
      rescue => e
        Rails.logger.error "Discoursecord: Failed to write cache file: #{e.message}"
      end
    end
  end
end
