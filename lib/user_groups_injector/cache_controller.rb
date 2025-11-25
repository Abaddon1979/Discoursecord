# frozen_string_literal: true

module ::Discoursecord
  class CacheController < ::ApplicationController
    requires_plugin 'Discoursecord'
    
    skip_before_action :verify_authenticity_token, only: [:user_cache]
    skip_before_action :preload_json, only: [:user_cache]
    skip_before_action :check_xhr, only: [:user_cache]

    def user_cache
      cache_path = File.join(Rails.root, 'plugins', 'Discoursecord', 'user-cache.json')
      
      if File.exist?(cache_path)
        cache_data = JSON.parse(File.read(cache_path))
        render json: cache_data
      else
        # Cache doesn't exist, trigger build
        Jobs.enqueue(:build_discoursecord_cache)
        render json: { users: {}, generated_at: Time.now.to_i, status: 'building' }
      end
    rescue => e
      Rails.logger.error "Discoursecord: Error serving cache: #{e.message}"
      render json: { error: 'Failed to load cache', users: {} }, status: 500
    end
  end
end
