# Installation Guide for User Groups Injector Plugin

## Quick Installation

### Prerequisites

- Discourse 3.0.0 or higher
- Admin access to your Discourse instance
- SSH access to your server (for self-hosted instances)

### Installation Steps

1. **Navigate to your Discourse plugins directory:**
   ```bash
   cd /var/www/discourse/plugins
   ```

2. **Clone the plugin repository:**
   ```bash
   git clone https://github.com/yourusername/user-groups-injector.git
   ```

3. **Rebuild your Discourse container:**
   ```bash
   cd /var/www/discourse
   ./launcher rebuild app
   ```

4. **Wait for the rebuild to complete** (this may take 5-15 minutes)

5. **Enable the plugin:**
   - Log in to your Discourse site as an admin
   - Go to `Admin` > `Plugins`
   - Find "User Groups Injector" in the list
   - Click the enable button if it's not already enabled

### Verification

1. **Check plugin is active:**
   - Go to `Admin` > `Plugins`
   - Verify "User Groups Injector" shows as enabled

2. **Configure initial settings:**
   - Go to `Admin` > `Plugins` > "User Groups Injector" > `Settings`
   - Ensure "User Groups Injector Enabled" is checked
   - Set your group rankings and colors

3. **Test functionality:**
   - Visit a chat channel with active users
   - Check that usernames show group indicators
   - Verify user profile links have appropriate colors

## Manual Installation (Alternative)

If you cannot use git, you can install manually:

1. **Create the plugin directory:**
   ```bash
   mkdir -p /var/www/discourse/plugins/user-groups-injector
   ```

2. **Download the plugin files:**
   - Download the ZIP from GitHub
   - Extract all files to the plugin directory

3. **Set proper permissions:**
   ```bash
   chown -R discourse:discourse /var/www/discourse/plugins/user-groups-injector
   ```

4. **Rebuild and enable** (follow steps 3-5 above)

## Configuration After Installation

### Basic Setup

1. **Access plugin settings:**
   - `Admin` > `Plugins` > "User Groups Injector" > `Settings`

2. **Configure group rankings:**
   - Enter groups in priority order (highest first)
   - Example: `admin,staff,moderator,vip,patron`

3. **Set group colors:**
   - Use JSON format for colors
   - Example: `{"admin":"#e74c3c","staff":"#f39c12","moderator":"#3498db"}`

### Verify Groups

1. **Check your Discourse groups:**
   - Go to `Admin` > `Groups`
   - Note the exact names of your groups (case-sensitive)

2. **Update plugin settings:**
   - Use exact group names from your Discourse instance
   - Ensure spelling matches exactly

## Troubleshooting

### Plugin Not Showing

1. **Check installation:**
   ```bash
   cd /var/www/discourse/plugins
   ls -la user-groups-injector
   ```

2. **Rebuild if necessary:**
   ```bash
   cd /var/www/discourse
   ./launcher rebuild app
   ```

3. **Check logs:**
   ```bash
   ./launcher logs app
   ```

### Groups Not Appearing

1. **Verify group names:**
   - Check exact spelling and case
   - Ensure groups exist in Discourse

2. **Check plugin settings:**
   - Verify rankings are comma-separated
   - Ensure JSON colors are valid

3. **Clear browser cache:**
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Try incognito/private browsing

### Performance Issues

1. **Check server resources:**
   - Monitor CPU and memory usage
   - Consider upgrading if needed

2. **Optimize settings:**
   - Limit number of tracked groups
   - Use simple color codes

## Uninstallation

To remove the plugin:

1. **Disable in admin panel:**
   - `Admin` > `Plugins`
   - Disable "User Groups Injector"

2. **Remove plugin files:**
   ```bash
   cd /var/www/discourse/plugins
   rm -rf user-groups-injector
   ```

3. **Rebuild:**
   ```bash
   cd /var/www/discourse
   ./launcher rebuild app
   ```

## Updates

To update the plugin:

1. **Navigate to plugin directory:**
   ```bash
   cd /var/www/discourse/plugins/user-groups-injector
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

3. **Rebuild:**
   ```bash
   cd /var/www/discourse
   ./launcher rebuild app
   ```

## Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Search GitHub issues:** [User Groups Injector Issues](https://github.com/yourusername/user-groups-injector/issues)
3. **Visit Discourse Meta:** [Meta.Discourse.org](https://meta.discourse.org/)
4. **Create a new issue** with:
   - Discourse version
   - Plugin version
   - Error messages
   - Steps to reproduce

## Customization

### Custom CSS

Add custom styles in `Admin` > `Customize` > `CSS`:

```css
/* Custom group styles */
.is-custom-group {
  color: #your-color !important;
  font-weight: bold;
}
```

### Custom JavaScript

For advanced customizations, use `Admin` > `Customize` > `JavaScript`:

```javascript
// Custom group handling
api.onPageChange(() => {
  // Your custom code here
});
```

## Security Considerations

- Plugin only reads existing group data
- No user data is modified
- All styling is client-side only
- No external API calls required
- Respects Discourse permissions system

## Performance Impact

- Minimal server overhead
- Caching reduces API calls
- Debounced DOM updates
- Only processes relevant elements
- No database modifications

## Compatibility

- **Discourse:** 3.0.0 and higher
- **Ruby:** 2.7.0 and higher  
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** Full responsive support
