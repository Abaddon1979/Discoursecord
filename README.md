# User Groups Injector Plugin

A Discourse plugin that injects user groups into HTML elements throughout the site with customizable colors and ranking.

## Features

- **Automatic Group Injection**: Automatically adds group classes to user elements in chat messages and posts
- **Admin Interface**: Easy-to-use admin panel for managing group rankings and colors
- **Priority-Based Coloring**: Users are colored based on their highest-ranked group
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Accessibility Support**: Includes proper ARIA labels and keyboard navigation
- **Real-time Updates**: Changes are applied immediately without page refresh

## Installation

1. Clone this repository into your Discourse plugins directory:
   ```bash
   cd /var/www/discourse/plugins
   git clone https://github.com/yourusername/user-groups-injector.git
   ```

2. Rebuild your Discourse instance:
   ```bash
   cd /var/www/discourse
   ./launcher rebuild app
   ```

3. Enable the plugin in the Discourse admin panel under `Plugins` > `User Groups Injector`

## Configuration

### Basic Setup

1. Go to `Admin` > `Plugins` > `User Groups Injector` > `Settings`
2. Enable the plugin if not already enabled
3. Configure your group rankings (comma-separated, highest priority first)
4. Set custom colors for each group using hex codes

### Group Rankings

Enter groups in order of priority (highest first):
```
admin,staff,moderator,vip,patron,contributor
```

### Group Colors

Use JSON format to assign colors to groups:
```json
{
  "admin": "#e74c3c",
  "staff": "#f39c12", 
  "moderator": "#3498db",
  "vip": "#9b59b6",
  "patron": "#2ecc71"
}
```

## Usage

### Chat Messages

The plugin automatically adds group classes to chat message usernames:
```html
<span class="chat-message-info__username is-username is-staff is-admin clickable" data-user-card="FactoryGirl">
  <span class="chat-message-info__username__name">FactoryGirl</span>
</span>
```

### User Links

User profile links are enhanced with group information:
```html
<a href="/u/cumminschick" class="is-staff is-moderator" data-user-card="CumminsChick">
  CumminsChick
</a>
```

### User Avatars

Avatar elements get colored borders based on the user's highest-ranked group:
```html
<img class="avatar is-admin" data-user-card="FactoryGirl" style="border-color: #e74c3c;">
```

## HTML Elements Affected

- `.chat-message-info__username` - Chat message usernames
- `a[data-user-card]` - User profile links
- `.avatar[data-user-card]` - User avatars

## CSS Classes Added

For each group a user belongs to, the plugin adds:
- `is-{groupname}` - Standard group class (e.g., `is-admin`, `is-staff`)
- Colors and styles are applied based on the highest-ranked group

## Admin Interface Features

### Group Manager

- **Drag & Drop**: Reorder groups by priority
- **Color Picker**: Choose custom colors for each group
- **Preview Mode**: See changes in real-time
- **Import/Export**: Backup and restore configurations

### Settings Options

- Enable/disable the plugin
- Configure group priority order
- Set custom colors for each group
- Reset to default settings

## Styling Options

### Default Styles

The plugin includes sensible defaults for common groups:
- **Admin**: Red color with crown emoji 👑
- **Moderator**: Blue color with shield emoji 🛡️
- **Staff**: Orange color with star emoji ⭐

### Custom CSS

You can override styles by adding custom CSS:
```css
.is-admin {
  color: #ff0000 !important;
  font-weight: bold;
}

.is-vip {
  background: linear-gradient(45deg, #gold, #silver);
}
```

## API Integration

The plugin extends Discourse serializers to include:

### Basic User Serializer
- `user_groups`: Array of group names
- `highest_ranked_group`: User's highest priority group
- `group_color`: Hex color for the highest-ranked group

### Chat Message Serializer
- `user_groups`: User's group memberships
- `highest_ranked_group`: Highest priority group
- `group_color`: Associated color

## JavaScript API

The plugin exposes a global API for debugging:
```javascript
// Manually inject groups
UserGroupsInjector.injectUserGroups();

// Get user data
const userData = await UserGroupsInjector.fetchUserData('username');

// Get highest ranked group for a user
const group = UserGroupsInjector.getHighestRankedGroup(['admin', 'staff']);

// Get color for a group
const color = UserGroupsInjector.getGroupColor('admin');
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Proper color contrast ratios
- Screen reader support
- Keyboard navigation
- Reduced motion support
- High contrast mode compatibility

## Troubleshooting

### Groups Not Showing

1. Ensure the plugin is enabled
2. Check that users are assigned to groups
3. Verify group rankings are configured
4. Clear browser cache and refresh

### Colors Not Applying

1. Check the group color configuration
2. Verify hex color format (#RRGGBB)
3. Ensure CSS is loading properly
4. Check for conflicting styles

### Performance Issues

1. The plugin includes caching to minimize API calls
2. Debouncing prevents excessive DOM updates
3. MutationObserver only watches relevant elements

## Development

### Local Setup

1. Clone the repository
2. Install dependencies: `bundle install`
3. Run tests: `bundle exec rspec`
4. Check code style: `bundle exec rubocop`

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This plugin is released under the MIT License. See [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

- GitHub Issues: [Report bugs and request features](https://github.com/yourusername/user-groups-injector/issues)
- Discourse Meta: [Community discussion](https://meta.discourse.org/)
- Email: your.email@example.com

## Credits

- Original concept and implementation by Your Name
- Inspired by Discourse community feedback
- Built with the Discourse Plugin API
