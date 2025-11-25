// Discoursecord - Inject user groups and colors into chat, links, and avatars
/* eslint-disable no-console */
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "discoursecord-groups",
  initialize(container) {
    withPluginApi("0.8.7", (api) => {
      // Ensure the User model knows about our custom attributes
      // This is necessary for Ember Data to retain these fields from the JSON payload
      api.modifyClass("model:user", {
        pluginId: "discoursecord",
        user_groups: null,
        group_color: null,
      });

      // Cache for fetched user data (stores the final data)
      const userDataCache = new Map();
      // Cache for in-flight requests (stores promises to prevent duplicate concurrent fetches)
      const inflightRequests = new Map();

      async function fetchUserData(username) {
        // Check data cache first
        if (userDataCache.has(username)) {
          return userDataCache.get(username);
        }

        // Check if we're already fetching this user
        if (inflightRequests.has(username)) {
          // console.debug(`Discoursecord: Already fetching ${username}, waiting for existing request`);
          return await inflightRequests.get(username);
        }

        // Create the fetch promise
        const fetchPromise = (async () => {
          try {
            // Optimization: Check local Ember Data store first
            const store = container.lookup("service:store");
            if (store) {
              const users = store.peekAll("user");
              let user = users.findBy("username", username);

              if (!user) {
                // Try case-insensitive search if exact match fails
                user = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
              }

              if (user) {
                // Ember objects use .get()
                const groups = user.get("user_groups");
                const color = user.get("group_color");

                // Only use if we actually have the groups data
                if (groups) {
                  const data = { user_groups: groups, group_color: color };
                  userDataCache.set(username, data);
                  // console.debug(`Discoursecord: Found ${username} in store`, data);
                  return data;
                }
              }
            }
          } catch (err) {
            console.debug("Discoursecord: Store lookup failed", err);
          }

          // Fallback to API fetch
          // console.debug(`Discoursecord: Fetching ${username} from API`);
          try {
            const response = await fetch(`/u/${encodeURIComponent(username)}.json`);
            if (!response.ok) {
              return null;
            }
            const data = await response.json();
            const userData = data.user;
            userDataCache.set(username, userData);
            return userData;
          } catch {
            return null;
          }
        })();

        // Store the promise
        inflightRequests.set(username, fetchPromise);

        try {
          const result = await fetchPromise;
          return result;
        } finally {
          // Clean up the inflight request after it completes
          inflightRequests.delete(username);
        }
      }

      // Fallback helpers (we prefer server-provided fields)
      let groupRankings = [];
      let groupColors = {};
      function getHighestRankedGroup(userGroups) {
        if (!userGroups || userGroups.length === 0) return null;
        const sortedGroups = userGroups
          .map((g) => g.toLowerCase())
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
      function getGroupColor(group) {
        if (!group) return null;
        return groupColors[group] || null;
      }

      // Normalize group names to expected class suffixes (singularize common groups)
      function normalizeGroupName(g) {
        g = String(g || "").toLowerCase().replace(/\s+/g, "-");
        if (g === "admins") return "admin";
        if (g === "moderators") return "moderator";
        return g; // staff, trust_level_N, etc.
      }

      // Inject into chat username nodes
      async function injectChatMessageGroups() {
        const chatUsernames = document.querySelectorAll(".chat-message-info__username");
        for (const element of chatUsernames) {
          const nameElement = element.querySelector(".chat-message-info__username__name");
          const attrUsername = element.getAttribute("data-user-card");
          const username =
            (attrUsername && attrUsername.trim()) ||
            (nameElement && nameElement.textContent && nameElement.textContent.trim());
          if (!username) continue;

          // prevent duplicate class injection, but still allow recoloring inner span
          const alreadyInjected = element.dataset.groupsInjected === "true";

          const userData = await fetchUserData(username);
          if (!userData) continue;

          const groups = userData.user_groups || [];
          // add classes like is-admin, is-staff, is-trust_level_3
          if (!alreadyInjected) {
            groups.forEach((group) => {
              element.classList.add(`is-${normalizeGroupName(group)}`);
            });
          }

          // prefer server-provided color
          const highestGroup = getHighestRankedGroup(groups);
          const color = userData.group_color || getGroupColor(highestGroup);
          if (color) {
            // Apply specifically to inner name span if present; otherwise fallback to container
            if (nameElement) {
              nameElement.style.setProperty("color", color, "important");
            } else {
              element.style.setProperty("color", color, "important");
            }
          }

          element.dataset.groupsInjected = "true";
        }
      }

      // Inject into user profile links
      async function injectUserLinkGroups() {
        const userLinks = document.querySelectorAll("a[data-user-card]");
        for (const link of userLinks) {
          const username = link.getAttribute("data-user-card");
          if (!username) continue;
          if (link.dataset.groupsInjected === "true") continue;

          const userData = await fetchUserData(username);
          if (!userData) continue;

          const groups = userData.user_groups || [];
          groups.forEach((group) => {
            link.classList.add(`is-${normalizeGroupName(group)}`);
          });

          const highestGroup = getHighestRankedGroup(groups);
          const color = userData.group_color || getGroupColor(highestGroup);
          if (color) {
            link.style.setProperty("color", color, "important");
          }

          link.dataset.groupsInjected = "true";
        }
      }

      // Inject into avatars/cards
      async function injectAvatarGroups() {
        const userAvatars = document.querySelectorAll(".avatar[data-user-card]");
        for (const avatar of userAvatars) {
          const username = avatar.getAttribute("data-user-card");
          if (!username) continue;
          if (avatar.dataset.groupsInjected === "true") continue;

          const userData = await fetchUserData(username);
          if (!userData) continue;

          const groups = userData.user_groups || [];
          groups.forEach((group) => {
            avatar.classList.add(`is-${normalizeGroupName(group)}`);
          });

          const highestGroup = getHighestRankedGroup(groups);
          const color = userData.group_color || getGroupColor(highestGroup);
          if (color) {
            avatar.style.setProperty("border-color", color, "important");
            avatar.style.setProperty("border-width", "2px", "important");
            avatar.style.setProperty("border-style", "solid", "important");
          }

          avatar.dataset.groupsInjected = "true";
        }
      }

      async function injectUserGroups() {
        await Promise.all([
          injectChatMessageGroups(),
          injectUserLinkGroups(),
          injectAvatarGroups(),
        ]);
      }

      // Debounced inject
      let debounceTimeout;
      function debouncedInject() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(injectUserGroups, 500);
      }

      // Initial kick - run immediately and again after short delay
      injectUserGroups();
      setTimeout(injectUserGroups, 300);

      // Observe DOM changes for chat, links, avatars
      const observer = new MutationObserver((mutations) => {
        let shouldInject = false;
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            const addedNodes = Array.from(mutation.addedNodes);
            const hasRelevant = addedNodes.some((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return false;
              return (
                (node.querySelector &&
                  (node.querySelector(".chat-message-info__username") ||
                    node.querySelector("a[data-user-card]") ||
                    node.querySelector(".avatar[data-user-card]"))) ||
                node.classList?.contains("chat-message-info__username") ||
                (node.tagName === "A" && node.hasAttribute("data-user-card")) ||
                (node.classList?.contains("avatar") && node.hasAttribute("data-user-card"))
              );
            });
            if (hasRelevant) {
              shouldInject = true;
            }
          }
        }
        if (shouldInject) debouncedInject();
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Hook route navigation
      try {
        const router = container.lookup("router:main");
        if (router && typeof router.on === "function") {
          router.on("routeDidChange", debouncedInject);
        }
      } catch {
        // ignore
      }

      // Expose for manual trigger/debug
      window.Discoursecord = {
        injectUserGroups,
        fetchUserData,
        getHighestRankedGroup,
        getGroupColor,
      };
    });
  },
};
