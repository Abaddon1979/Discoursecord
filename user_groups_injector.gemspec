# frozen_string_literal: true

require_relative "lib/user_groups_injector/version"

Gem::Specification.new do |spec|
  spec.name = "user_groups_injector"
  spec.version = UserGroupsInjector::VERSION
  spec.authors = ["Your Name"]
  spec.email = ["your.email@example.com"]

  spec.summary = "Inject user groups into HTML elements with customizable colors and ranking"
  spec.description = <<~DESCRIPTION
    A Discourse plugin that injects user groups into HTML elements throughout the site.
    Features include:
    - Automatic injection of group classes into chat messages and user links
    - Admin interface for ranking groups by priority
    - Custom color assignment for each group
    - Dynamic color application based on highest-ranked group
    - Responsive design and accessibility support
  DESCRIPTION
  spec.homepage = "https://github.com/yourusername/user-groups_injector"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 2.7.0"

  spec.metadata["allowed_push_host"] = "https://rubygems.org"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/yourusername/user_groups_injector"
  spec.metadata["changelog_uri"] = "https://github.com/yourusername/user_groups_injector/blob/main/CHANGELOG.md"
  spec.metadata["bug_tracker_uri"] = "https://github.com/yourusername/user_groups_injector/issues"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features)/|\.(?:git|circleci)|appveyor)})
    end
  end

  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }

  # Discourse plugin dependencies
  spec.add_dependency "discourse-plugin", "~> 2.0"

  # Development dependencies
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.0"
  spec.add_development_dependency "rubocop-discourse", "~> 2.0"
  spec.add_development_dependency "syntax_tree", "~> 6.0"

  # Metadata for Discourse plugin registry
  spec.metadata["plugin_type"] = "discourse"
  spec.metadata["discourse_compatible"] = "latest"
  spec.metadata["minimum_discourse_version"] = "3.0.0"
  spec.metadata["tested_discourse_version"] = "3.1.0"
  
  # Plugin categories for better discoverability
  spec.metadata["categories"] = "user management, styling, chat"
  
  # Plugin tags
  spec.metadata["tags"] = "groups, colors, chat, users, admin"
  
  # Plugin repository information
  spec.metadata["repository"] = {
    "type" => "git",
    "url" => "https://github.com/yourusername/user_groups_injector.git",
    "web" => "https://github.com/yourusername/user_groups_injector"
  }
  
  # Plugin documentation
  spec.metadata["documentation"] = {
    "readme" => "https://github.com/yourusername/user_groups_injector/blob/main/README.md",
    "changelog" => "https://github.com/yourusername/user_groups_injector/blob/main/CHANGELOG.md"
  }
  
  # Author information
  spec.metadata["author"] = {
    "name" => "Your Name",
    "email" => "your.email@example.com",
    "url" => "https://github.com/yourusername"
  }
  
  # License information
  spec.metadata["license"] = {
    "type" => "MIT",
    "url" => "https://opensource.org/licenses/MIT"
  }
  
  # Plugin compatibility information
  spec.metadata["compatibility"] = {
    "discourse" => {
      "minimum" => "3.0.0",
      "tested" => "3.1.0",
      "maximum" => nil
    },
    "ruby" => {
      "minimum" => "2.7.0",
      "recommended" => "3.0.0"
    },
    "browsers" => {
      "chrome" => "90+",
      "firefox" => "88+",
      "safari" => "14+",
      "edge" => "90+"
    }
  }
end
