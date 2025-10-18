// User Groups Injector Plugin
// This plugin injects user groups into HTML elements and applies styling based on group rankings

(function() {
    'use strict';

    // Store user data cache
    const userDataCache = new Map();
    let groupRankings = [];
    let groupColors = {};

    // Fetch user data from the API
    async function fetchUserData(username) {
        if (userDataCache.has(username)) {
            return userDataCache.get(username);
        }

        try {
            const response = await fetch(`/u/${username}.json`);
            if (!response.ok) {
                console.warn(`Failed to fetch user data for ${username}`);
                return null;
            }
            
            const data = await response.json();
            userDataCache.set(username, data.user);
            return data.user;
        } catch (error) {
            console.error(`Error fetching user data for ${username}:`, error);
            return null;
        }
    }

    // Fetch plugin settings
    async function fetchPluginSettings() {
        try {
            const response = await fetch('/admin/site_settings/category/discoursecord.json');
            if (!response.ok) {
                console.warn('Failed to fetch plugin settings');
                return;
            }
            
            const data = await response.json();
            const rankingSetting = data.site_settings.find(s => s.setting === 'discoursecord_group_rankings');
            const colorSetting = data.site_settings.find(s => s.setting === 'discoursecord_group_colors');
            
            if (rankingSetting && rankingSetting.value) {
                groupRankings = rankingSetting.value.split(',').map(g => g.trim().toLowerCase());
            }
            
            if (colorSetting && colorSetting.value) {
                try {
                    groupColors = JSON.parse(colorSetting.value);
                } catch (e) {
                    console.warn('Failed to parse group colors:', e);
                }
            }
        } catch (error) {
            console.error('Error fetching plugin settings:', error);
        }
    }

    // Get highest ranked group for a user
    function getHighestRankedGroup(userGroups) {
        if (!userGroups || userGroups.length === 0) return null;
        
        const sortedGroups = userGroups
            .map(g => g.toLowerCase())
            .sort((a, b) => {
                const aIndex = groupRankings.indexOf(a);
                const bIndex = groupRankings.indexOf(b);
                
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                
                return aIndex - bIndex;
            });
        
        return sortedGroups[0];
    }

    // Get color for a group
    function getGroupColor(group) {
        if (!group) return null;
        return groupColors[group] || null;
    }

    // Inject groups into chat message username elements
    async function injectChatMessageGroups() {
        const chatUsernames = document.querySelectorAll('.chat-message-info__username');
        
        for (const element of chatUsernames) {
            const nameElement = element.querySelector('.chat-message-info__username__name');
            if (!nameElement) continue;
            
            const username = nameElement.textContent.trim();
            if (!username) continue;
            
            const userData = await fetchUserData(username);
            if (!userData) continue;
            
            // Add group classes
            const groups = userData.user_groups || [];
            groups.forEach(group => {
                element.classList.add(`is-${group.toLowerCase().replace(/\s+/g, '-')}`);
            });
            
            // Apply color styling
            const highestGroup = getHighestRankedGroup(groups);
            const color = getGroupColor(highestGroup);
            
            if (color) {
                element.style.color = color;
            }
        }
    }

    // Inject groups into user profile links
    async function injectUserLinkGroups() {
        const userLinks = document.querySelectorAll('a[data-user-card]');
        
        for (const link of userLinks) {
            const username = link.getAttribute('data-user-card');
            if (!username) continue;
            
            // Skip if already processed
            if (link.dataset.groupsInjected === 'true') continue;
            
            const userData = await fetchUserData(username);
            if (!userData) continue;
            
            // Add group classes
            const groups = userData.user_groups || [];
            groups.forEach(group => {
                link.classList.add(`is-${group.toLowerCase().replace(/\s+/g, '-')}`);
            });
            
            // Apply color styling
            const highestGroup = getHighestRankedGroup(groups);
            const color = getGroupColor(highestGroup);
            
            if (color) {
                link.style.color = color;
            }
            
            link.dataset.groupsInjected = 'true';
        }
    }

    // Inject groups into user avatars and cards
    async function injectAvatarGroups() {
        const userAvatars = document.querySelectorAll('.avatar[data-user-card]');
        
        for (const avatar of userAvatars) {
            const username = avatar.getAttribute('data-user-card');
            if (!username) continue;
            
            // Skip if already processed
            if (avatar.dataset.groupsInjected === 'true') continue;
            
            const userData = await fetchUserData(username);
            if (!userData) continue;
            
            // Add group classes
            const groups = userData.user_groups || [];
            groups.forEach(group => {
                avatar.classList.add(`is-${group.toLowerCase().replace(/\s+/g, '-')}`);
            });
            
            // Apply border color based on highest ranked group
            const highestGroup = getHighestRankedGroup(groups);
            const color = getGroupColor(highestGroup);
            
            if (color) {
                avatar.style.borderColor = color;
                avatar.style.borderWidth = '2px';
                avatar.style.borderStyle = 'solid';
            }
            
            avatar.dataset.groupsInjected = 'true';
        }
    }

    // Main injection function
    async function injectUserGroups() {
        await fetchPluginSettings();
        await Promise.all([
            injectChatMessageGroups(),
            injectUserLinkGroups(),
            injectAvatarGroups()
        ]);
    }

    // Debounced function to avoid excessive calls
    let debounceTimeout;
    function debouncedInject() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(injectUserGroups, 500);
    }

    // Initialize the plugin
    function initialize() {
        // Initial injection
        setTimeout(injectUserGroups, 1000);
        
        // Watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            let shouldInject = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    
                    // Check if any relevant elements were added
                    const hasRelevantElements = addedNodes.some(node => {
                        if (node.nodeType !== Node.ELEMENT_NODE) return false;
                        
                        return (
                            node.querySelector && (
                                node.querySelector('.chat-message-info__username') ||
                                node.querySelector('a[data-user-card]') ||
                                node.querySelector('.avatar[data-user-card]')
                            )
                        ) || (
                            node.classList.contains('chat-message-info__username') ||
                            (node.tagName === 'A' && node.hasAttribute('data-user-card')) ||
                            (node.classList.contains('avatar') && node.hasAttribute('data-user-card'))
                        );
                    });
                    
                    if (hasRelevantElements) {
                        shouldInject = true;
                    }
                }
            });
            
            if (shouldInject) {
                debouncedInject();
            }
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also inject on page navigation (for single-page apps)
        if (window.Discourse) {
            window.Discourse.__container__.lookup('router:main').on('routeDidChange', debouncedInject);
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose functions for debugging
    window.Discoursecord = {
        injectUserGroups,
        fetchUserData,
        getHighestRankedGroup,
        getGroupColor
    };

})();
