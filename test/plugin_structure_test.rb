# frozen_string_literal: true

require 'rails_helper'

RSpec.describe "User Groups Injector Plugin Structure" do
  it "has all required plugin files" do
    # Check main plugin file exists
    expect(File.exist?('plugin.rb')).to be true
    
    # Check JavaScript assets
    expect(File.exist?('assets/javascripts/user-groups-injector.js')).to be true
    
    # Check CSS assets
    expect(File.exist?('assets/stylesheets/user-groups-injector.scss')).to be true
    
    # Check locale files
    expect(File.exist?('config/locales/server.en.yml')).to be true
    expect(File.exist?('config/locales/client.en.yml')).to be true
    
    # Check gemspec
    expect(File.exist?('user_groups_injector.gemspec')).to be true
    
    # Check version file
    expect(File.exist?('lib/user_groups_injector/version.rb')).to be true
    
    # Check documentation
    expect(File.exist?('README.md')).to be true
  end
  
  it "has valid plugin.rb structure" do
    plugin_content = File.read('plugin.rb')
    
    # Check for required plugin elements
    expect(plugin_content).to include("def name")
    expect(plugin_content).to include("'user-groups-injector'")
    expect(plugin_content).to include("enabled_site_setting")
    expect(plugin_content).to include("after_initialize")
    expect(plugin_content).to include("register_asset")
  end
  
  it "has valid version file" do
    version_content = File.read('lib/user_groups_injector/version.rb')
    expect(version_content).to include("module UserGroupsInjector")
    expect(version_content).to include("VERSION")
  end
  
  it "has valid gemspec" do
    gemspec_content = File.read('user_groups_injector.gemspec')
    expect(gemspec_content).to include("Gem::Specification.new")
    expect(gemspec_content).to include("discourse-plugin")
    expect(gemspec_content).to include("UserGroupsInjector::VERSION")
  end
  
  it "has JavaScript with required functionality" do
    js_content = File.read('assets/javascripts/user-groups-injector.js')
    
    # Check for key functions
    expect(js_content).to include("fetchUserData")
    expect(js_content).to include("injectChatMessageGroups")
    expect(js_content).to include("injectUserLinkGroups")
    expect(js_content).to include("getHighestRankedGroup")
    expect(js_content).to include("MutationObserver")
  end
  
  it "has SCSS with required styles" do
    scss_content = File.read('assets/stylesheets/user-groups-injector.scss')
    
    # Check for key selectors
    expect(scss_content).to include(".chat-message-info__username")
    expect(scss_content).to include("a[data-user-card]")
    expect(scss_content).to include(".avatar[data-user-card]")
    expect(scss_content).to include(".is-admin")
    expect(scss_content).to include(".is-staff")
  end
end
