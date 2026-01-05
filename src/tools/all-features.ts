/**
 * WordPress All Features Tools
 * Users, Taxonomy, Comments, Site Management, Plugins, Themes, Settings
 */
import { Responses } from "quickmcp-sdk";
import {
  callWordPressAPI,
  callWordPressRootAPI,
  callWooCommerceAPI,
  callBanildToolsAPI,
  searchWordPressOrgPlugins,
} from "../utils/api.js";
import { formatUser, formatComment, buildQueryString } from "../utils/helpers.js";

export function registerAllFeatureTools(server: any) {
  // ========== USERS ==========
  server.tool(
    "wordpress_create_user",
    async (args: any) => {
      const { username, email, password, roles = ["subscriber"], name } = args;
      try {
        const user = await callWordPressAPI("/users", "POST", {
          username,
          email,
          password,
          roles,
          name,
        });
        return Responses.success(formatUser(user), `✅ Created user: ${username}`);
      } catch (error: any) {
        return Responses.error(`Failed to create user: ${error.message}`);
      }
    },
    {
      description: "Create a new WordPress user with roles",
      schema: { 
        username: "string",    // Required: Username
        email: "string",       // Required: Email address
        password: "string",    // Required: Password
        roles: "array?",       // Optional: Array of roles (default: ['subscriber'])
        name: "string?"        // Optional: Display name
      },
    }
  );

  server.tool(
    "wordpress_get_users",
    async (args: any) => {
      const { perPage = 10, page = 1, roles, search } = args;
      try {
        const params: any = { per_page: perPage, page };
        if (roles) params.roles = roles;
        if (search) params.search = search;
        const queryString = buildQueryString(params);
        const users = await callWordPressAPI(`/users?${queryString}`);
        return Responses.success(
          { users: users.map(formatUser), count: users.length },
          `👥 Retrieved ${users.length} users`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get users: ${error.message}`);
      }
    },
    {
      description: "Get WordPress users with role filtering",
      schema: { 
        perPage: "number?",    // Optional: Results per page (default: 10)
        page: "number?",       // Optional: Page number (default: 1)
        roles: "string?",      // Optional: Filter by role
        search: "string?"      // Optional: Search term
      },
    }
  );

  server.tool(
    "wordpress_update_user",
    async (args: any) => {
      const { userId, updates } = args;
      try {
        const user = await callWordPressAPI(`/users/${userId}`, "PUT", updates);
        return Responses.success(formatUser(user), `✅ Updated user ID ${userId}`);
      } catch (error: any) {
        return Responses.error(`Failed to update user: ${error.message}`);
      }
    },
    {
      description: "Update user information (name, email, roles, password)",
      schema: { userId: "number", updates: "object" },
    }
  );

  server.tool(
    "wordpress_delete_user",
    async (args: any) => {
      const { userId, reassign } = args;
      try {
        const endpoint = reassign
          ? `/users/${userId}?reassign=${reassign}&force=true`
          : `/users/${userId}?force=true`;
        await callWordPressAPI(endpoint, "DELETE");
        return Responses.success({ id: userId, deleted: true }, `✅ Deleted user ID ${userId}`);
      } catch (error: any) {
        return Responses.error(`Failed to delete user: ${error.message}`);
      }
    },
    {
      description: "Delete a user (reassign their content to another user)",
      schema: { 
        userId: "number",      // Required: User ID to delete
        reassign: "number?"    // Optional: User ID to reassign content to
      },
    }
  );

  // ========== CATEGORIES ==========
  server.tool(
    "wordpress_create_category",
    async (args: any) => {
      const { name, description = "", parent = 0, slug } = args;
      try {
        const categoryData: any = { name, description, parent };
        if (slug) categoryData.slug = slug;
        const category = await callWordPressAPI("/categories", "POST", categoryData);
        return Responses.success(
          { id: category.id, name: category.name, slug: category.slug, parent: category.parent },
          `✅ Created category: "${name}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to create category: ${error.message}`);
      }
    },
    {
      description: "Create a new category with hierarchical support",
      schema: { 
        name: "string",        // Required: Category name
        description: "string?", // Optional: Category description
        parent: "number?",     // Optional: Parent category ID (default: 0)
        slug: "string?"        // Optional: URL slug
      },
    }
  );

  server.tool(
    "wordpress_get_categories",
    async (args: any) => {
      const { perPage = 100, parent, hideEmpty = false } = args || {};
      try {
        const params: any = { per_page: perPage, hide_empty: hideEmpty };
        if (parent !== undefined) params.parent = parent;
        const queryString = buildQueryString(params);
        const categories = await callWordPressAPI(`/categories?${queryString}`);
        return Responses.success(
          {
            categories: categories.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              count: cat.count,
              parent: cat.parent,
            })),
            total: categories.length,
          },
          `📁 Retrieved ${categories.length} categories`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get categories: ${error.message}`);
      }
    },
    {
      description: "Get all categories with hierarchy",
      schema: {
        perPage: "number?",    // Optional: Results per page (default: 100)
        parent: "number?",     // Optional: Filter by parent ID
        hideEmpty: "boolean?"  // Optional: Hide empty categories (default: false)
      },
    }
  );

  server.tool(
    "wordpress_update_category",
    async (args: any) => {
      const { categoryId, updates } = args;
      try {
        const category = await callWordPressAPI(`/categories/${categoryId}`, "PUT", updates);
        return Responses.success(
          { id: category.id, name: category.name },
          `✅ Updated category ID ${categoryId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to update category: ${error.message}`);
      }
    },
    {
      description: "Update category name, description, or parent",
      schema: { categoryId: "number", updates: "object" },
    }
  );

  server.tool(
    "wordpress_delete_category",
    async (args: any) => {
      const { categoryId, force = false } = args;
      try {
        const endpoint = force
          ? `/categories/${categoryId}?force=true`
          : `/categories/${categoryId}`;
        await callWordPressAPI(endpoint, "DELETE");
        return Responses.success(
          { id: categoryId, deleted: true },
          `✅ Deleted category ID ${categoryId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete category: ${error.message}`);
      }
    },
    {
      description: "Delete a category",
      schema: { 
        categoryId: "number",  // Required: Category ID to delete
        force: "boolean?"      // Optional: Force delete (default: false)
      },
    }
  );

  // ========== TAGS ==========
  server.tool(
    "wordpress_create_tag",
    async (args: any) => {
      const { name, description = "", slug } = args;
      try {
        const tagData: any = { name, description };
        if (slug) tagData.slug = slug;
        const tag = await callWordPressAPI("/tags", "POST", tagData);
        return Responses.success(
          { id: tag.id, name: tag.name, slug: tag.slug },
          `✅ Created tag: "${name}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to create tag: ${error.message}`);
      }
    },
    {
      description: "Create a new tag",
      schema: { 
        name: "string",        // Required: Tag name
        description: "string?", // Optional: Tag description
        slug: "string?"        // Optional: URL slug
      },
    }
  );

  server.tool(
    "wordpress_get_tags",
    async (args: any) => {
      const { perPage = 100, hideEmpty = false } = args || {};
      try {
        const params = { per_page: perPage, hide_empty: hideEmpty };
        const queryString = buildQueryString(params);
        const tags = await callWordPressAPI(`/tags?${queryString}`);
        return Responses.success(
          {
            tags: tags.map((tag: any) => ({
              id: tag.id,
              name: tag.name,
              slug: tag.slug,
              count: tag.count,
            })),
            total: tags.length,
          },
          `🏷️ Retrieved ${tags.length} tags`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get tags: ${error.message}`);
      }
    },
    {
      description: "Get all tags",
      schema: {
        perPage: "number?",    // Optional: Results per page (default: 100)
        hideEmpty: "boolean?"  // Optional: Hide empty tags (default: false)
      },
    }
  );

  // ========== COMMENTS ==========
  server.tool(
    "wordpress_create_comment",
    async (args: any) => {
      const { postId, content, author, authorEmail } = args;
      try {
        const commentData: any = { post: postId, content };
        if (author) commentData.author_name = author;
        if (authorEmail) commentData.author_email = authorEmail;
        const comment = await callWordPressAPI("/comments", "POST", commentData);
        return Responses.success(formatComment(comment), `✅ Created comment on post ${postId}`);
      } catch (error: any) {
        return Responses.error(`Failed to create comment: ${error.message}`);
      }
    },
    {
      description: "Create a comment on a post",
      schema: { 
        postId: "number",      // Required: Post ID to comment on
        content: "string",     // Required: Comment content
        author: "string?",     // Optional: Author name
        authorEmail: "string?" // Optional: Author email
      },
    }
  );

  server.tool(
    "wordpress_get_comments",
    async (args: any) => {
      const { postId, perPage = 10, status = "approve" } = args;
      try {
        const params: any = { per_page: perPage, status };
        if (postId) params.post = postId;
        const queryString = buildQueryString(params);
        const comments = await callWordPressAPI(`/comments?${queryString}`);
        return Responses.success(
          { comments: comments.map(formatComment), count: comments.length },
          `💬 Retrieved ${comments.length} comments`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get comments: ${error.message}`);
      }
    },
    {
      description: "Get comments with filtering by post and status",
      schema: { 
        postId: "number?",     // Optional: Filter by post ID
        perPage: "number?",    // Optional: Results per page (default: 10)
        status: "string?"      // Optional: 'approve', 'hold', 'spam' (default: 'approve')
      },
    }
  );

  server.tool(
    "wordpress_update_comment",
    async (args: any) => {
      const { commentId, status, content } = args;
      try {
        const updates: any = {};
        if (status) updates.status = status;
        if (content) updates.content = content;
        const comment = await callWordPressAPI(`/comments/${commentId}`, "PUT", updates);
        return Responses.success(formatComment(comment), `✅ Updated comment ID ${commentId}`);
      } catch (error: any) {
        return Responses.error(`Failed to update comment: ${error.message}`);
      }
    },
    {
      description: "Update comment (approve, spam, trash, edit content)",
      schema: { 
        commentId: "number",   // Required: Comment ID to update
        status: "string?",     // Optional: 'approve', 'hold', 'spam', 'trash'
        content: "string?"     // Optional: New comment content
      },
    }
  );

  server.tool(
    "wordpress_delete_comment",
    async (args: any) => {
      const { commentId, force = false } = args;
      try {
        const endpoint = force
          ? `/comments/${commentId}?force=true`
          : `/comments/${commentId}`;
        await callWordPressAPI(endpoint, "DELETE");
        return Responses.success(
          { id: commentId, deleted: true },
          `✅ Deleted comment ID ${commentId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete comment: ${error.message}`);
      }
    },
    {
      description: "Delete a comment",
      schema: { 
        commentId: "number",   // Required: Comment ID to delete
        force: "boolean?"      // Optional: Permanently delete (default: false)
      },
    }
  );

  // ========== SITE & SETTINGS ==========
  server.tool(
    "wordpress_get_site_info",
    async () => {
      try {
        const siteInfo = await callWordPressRootAPI();
        return Responses.success(
          {
            name: siteInfo.name,
            description: siteInfo.description,
            url: siteInfo.url,
            homeUrl: siteInfo.home,
            gmtOffset: siteInfo.gmt_offset,
            timezoneString: siteInfo.timezone_string,
            namespaces: siteInfo.namespaces,
            authentication: siteInfo.authentication,
            routes: Object.keys(siteInfo.routes || {}),
          },
          `ℹ️ Site: ${siteInfo.name}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get site info: ${error.message}`);
      }
    },
    {
      description: "Get complete WordPress site information including available API routes",
      schema: {},
    }
  );

  server.tool(
    "wordpress_test_connection",
    async () => {
      try {
        const user = await callWordPressAPI("/users/me");
        return Responses.success(
          { connected: true, user: formatUser(user) },
          `✅ Connected as ${user.name}`
        );
      } catch (error: any) {
        return Responses.error(`Connection test failed: ${error.message}`);
      }
    },
    {
      description: "Test WordPress connection and authentication",
      schema: {},
    }
  );

  server.tool(
    "wordpress_get_settings",
    async () => {
      try {
        const settings = await callWordPressAPI("/settings");
        return Responses.success(
          {
            title: settings.title,
            description: settings.description,
            url: settings.url,
            email: settings.email,
            timezone: settings.timezone,
            dateFormat: settings.date_format,
            timeFormat: settings.time_format,
            language: settings.language,
            postsPerPage: settings.posts_per_page,
          },
          `⚙️ Retrieved site settings`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get settings: ${error.message}`);
      }
    },
    {
      description: "Get WordPress site settings",
      schema: {},
    }
  );

  server.tool(
    "wordpress_update_settings",
    async (args: any) => {
      try {
        const settings = await callWordPressAPI("/settings", "PUT", args);
        return Responses.success(settings, `✅ Updated site settings`);
      } catch (error: any) {
        return Responses.error(`Failed to update settings: ${error.message}`);
      }
    },
    {
      description: "Update site settings (title, description, timezone, etc)",
      schema: {},
    }
  );

  server.tool(
    "wordpress_get_plugins",
    async () => {
      try {
        const plugins = await callWordPressAPI("/plugins");
        return Responses.success(
          {
            plugins: plugins.map((plugin: any) => ({
              plugin: plugin.plugin,
              status: plugin.status,
              name: plugin.name,
              version: plugin.version,
              author: plugin.author,
              description: plugin.description?.rendered || "",
            })),
            total: plugins.length,
          },
          `🔌 Retrieved ${plugins.length} plugins`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get plugins: ${error.message}`);
      }
    },
    {
      description: "Get all installed WordPress plugins",
      schema: {},
    }
  );

  server.tool(
    "wordpress_install_plugin",
    async (args: any) => {
      const { slug, zipUrl, activate = false } = args || {};
      try {
        if (!slug && !zipUrl) {
          return Responses.error("Provide either slug or zipUrl");
        }
        const payload: any = {};
        if (slug) payload.slug = slug;
        if (zipUrl) {
          payload.source_url = zipUrl;
          payload.zip_url = zipUrl;
        }
        if (activate === true) payload.status = "active";
        const result = await callWordPressAPI("/plugins", "POST", payload);
        const msgParts = ["🔌 Plugin installation complete"];
        if (slug) msgParts.push(`slug: ${slug}`);
        if (activate === true || result?.status === "active") msgParts.push("activated");
        return Responses.success(result, msgParts.join(" · "));
      } catch (error: any) {
        return Responses.error(`Failed to install plugin: ${error.message}`);
      }
    },
    {
      description: "Install a plugin by WordPress.org slug or by zip URL. Optionally activate after install.",
      schema: { 
        slug: "string?",       // Optional: WordPress.org plugin slug
        zipUrl: "string?",     // Optional: URL to plugin ZIP file
        activate: "boolean?"   // Optional: Activate after install (default: false)
      },
    }
  );

  server.tool(
    "wordpress_activate_plugin",
    async (args: any) => {
      const { pluginFile, slug } = args || {};
      try {
        let targetPlugin = pluginFile;
        if (!targetPlugin && slug) {
          const plugins = await callWordPressAPI("/plugins");
          const match = plugins.find(
            (p: any) => typeof p?.plugin === "string" && p.plugin.startsWith(`${slug}/`)
          );
          if (match) targetPlugin = match.plugin;
        }
        if (!targetPlugin) {
          return Responses.error("Provide pluginFile (e.g., 'akismet/akismet.php') or a valid slug");
        }
        const updated = await callWordPressAPI(
          `/plugins/${encodeURIComponent(targetPlugin)}`,
          "PUT",
          { status: "active" }
        );
        return Responses.success(
          { plugin: targetPlugin, status: updated?.status || "active" },
          `✅ Activated plugin ${targetPlugin}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to activate plugin: ${error.message}`);
      }
    },
    {
      description: "Activate an installed plugin. Provide pluginFile or slug to resolve it.",
      schema: { 
        pluginFile: "string?", // Optional: Plugin file path (e.g., 'akismet/akismet.php')
        slug: "string?"        // Optional: Plugin slug to find
      },
    }
  );

  server.tool(
    "wordpress_search_plugins",
    async (args: any) => {
      const { query, page = 1, perPage = 10 } = args || {};
      try {
        if (!query) return Responses.error("Query is required");
        const results = await searchWordPressOrgPlugins(query, page, perPage);
        return Responses.success(
          { results, count: results.length, page, perPage },
          `🔍 Found ${results.length} plugins for "${query}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to search plugins: ${error.message}`);
      }
    },
    {
      description: "Search WordPress.org plugin directory by keyword",
      schema: { 
        query: "string",       // Required: Search keyword
        page: "number?",       // Optional: Page number (default: 1)
        perPage: "number?"     // Optional: Results per page (default: 10)
      },
    }
  );

  server.tool(
    "wordpress_get_themes",
    async () => {
      try {
        const themes = await callWordPressAPI("/themes");
        return Responses.success(
          {
            themes: themes.map((theme: any) => ({
              stylesheet: theme.stylesheet,
              name: theme.name?.rendered || theme.stylesheet,
              version: theme.version,
              author: theme.author,
              status: theme.status,
            })),
            total: themes.length,
          },
          `🎨 Retrieved ${themes.length} themes`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get themes: ${error.message}`);
      }
    },
    {
      description: "Get all installed WordPress themes",
      schema: {},
    }
  );

  // SEO Meta
  server.tool(
    "wordpress_set_seo_meta",
    async (args: any) => {
      const {
        postId,
        productId,
        metaDescription,
        focusKeyword,
        canonicalUrl,
        ogTitle,
        ogDescription,
        twitterTitle,
        twitterDescription,
      } = args;
      if (!postId && !productId) {
        return Responses.error("Provide either postId or productId");
      }
      try {
        const meta: any = {};
        if (metaDescription) meta._yoast_wpseo_metadesc = metaDescription;
        if (focusKeyword) meta._yoast_wpseo_focuskw = focusKeyword;
        if (canonicalUrl) meta._yoast_wpseo_canonical = canonicalUrl;
        if (ogTitle) meta["_yoast_wpseo_opengraph-title"] = ogTitle;
        if (ogDescription) meta["_yoast_wpseo_opengraph-description"] = ogDescription;
        if (twitterTitle) meta["_yoast_wpseo_twitter-title"] = twitterTitle;
        if (twitterDescription) meta["_yoast_wpseo_twitter-description"] = twitterDescription;

        const targetId = productId || postId;
        const objectType = productId ? "product" : "post";
        let yoastIndexableUpdated = false;

        // Step 1: Update post meta (traditional storage)
        if (productId) {
          const meta_data = Object.entries(meta).map(([key, value]) => ({ key, value }));
          await callWooCommerceAPI(`/products/${productId}`, "PUT", { meta_data });
        } else {
          await callWordPressAPI(`/posts/${postId}`, "PUT", { meta });
        }

        // Step 2: Directly update wp_yoast_indexable table (Yoast SEO 26.6+ storage)
        // This ensures Yoast displays the correct SEO data in the editor
        try {
          const indexableData: any = {
            object_id: targetId,
            object_type: objectType,
          };
          if (metaDescription) indexableData.description = metaDescription;
          if (focusKeyword) indexableData.primary_focus_keyword = focusKeyword;
          if (ogTitle) indexableData.open_graph_title = ogTitle;
          if (ogDescription) indexableData.open_graph_description = ogDescription;
          if (twitterTitle) indexableData.twitter_title = twitterTitle;
          if (twitterDescription) indexableData.twitter_description = twitterDescription;
          if (canonicalUrl) indexableData.canonical = canonicalUrl;

          await callBanildToolsAPI("/yoast-indexable", "POST", indexableData);
          yoastIndexableUpdated = true;
        } catch {
          // BanildTools endpoint not available - post meta was still set successfully
        }

        const message = productId
          ? `✅ Set SEO metadata for product ${productId}`
          : `✅ Set SEO metadata for post ${postId}`;
        const suffix = yoastIndexableUpdated ? " (+ Yoast indexable)" : "";

        return Responses.success(
          { 
            [productId ? "productId" : "postId"]: targetId, 
            metaFieldsSet: Object.keys(meta),
            yoastIndexableUpdated,
          },
          message + suffix
        );
      } catch (error: any) {
        return Responses.error(`Failed to set SEO meta: ${error.message}`);
      }
    },
    {
      description: "Set SEO metadata for posts/products. Updates both post meta AND wp_yoast_indexable table for Yoast SEO 26.6+ compatibility (requires BanildTools plugin).",
      schema: { 
        postId: "number?",           // Optional: Post ID (provide postId or productId)
        productId: "number?",        // Optional: WooCommerce product ID
        metaDescription: "string?",  // Optional: Meta description
        focusKeyword: "string?",     // Optional: Focus keyword
        canonicalUrl: "string?",     // Optional: Canonical URL
        ogTitle: "string?",          // Optional: Open Graph title
        ogDescription: "string?",    // Optional: Open Graph description
        twitterTitle: "string?",     // Optional: Twitter card title
        twitterDescription: "string?" // Optional: Twitter card description
      },
    }
  );

  server.tool(
    "wordpress_set_custom_meta",
    async (args: any) => {
      const { postId, metaKey, metaValue } = args;
      try {
        const meta: any = {};
        meta[metaKey] = metaValue;
        await callWordPressAPI(`/posts/${postId}`, "PUT", { meta });
        return Responses.success(
          { postId, metaKey, metaValue, set: true },
          `✅ Set custom meta "${metaKey}" for post ${postId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to set custom meta: ${error.message}`);
      }
    },
    {
      description: "Set custom post metadata field - useful for custom fields and plugins",
      schema: { postId: "number", metaKey: "string", metaValue: "string" },
    }
  );

  // ========== GENERIC CUSTOM POST TYPES ==========
  server.tool(
    "wordpress_get_cpt",
    async (args: any) => {
      const { type, params = {} } = args;
      try {
        const query = buildQueryString(params);
        const items = await callWordPressAPI(`/${type}${query ? `?${query}` : ""}`);
        return Responses.success(
          { items, count: items.length, type },
          `📦 Retrieved ${items.length} from ${type}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get ${type}: ${error.message}`);
      }
    },
    {
      description: "Get custom post type items",
      schema: { 
        type: "string",        // Required: Custom post type name
        params: "object?"      // Optional: Query parameters
      },
    }
  );

  server.tool(
    "wordpress_create_cpt",
    async (args: any) => {
      const { type, data } = args;
      try {
        const item = await callWordPressAPI(`/${type}`, "POST", data);
        return Responses.success(item, `✅ Created ${type} item`);
      } catch (error: any) {
        return Responses.error(`Failed to create ${type}: ${error.message}`);
      }
    },
    {
      description: "Create a custom post type item",
      schema: { type: "string", data: "object" },
    }
  );

  server.tool(
    "wordpress_update_cpt",
    async (args: any) => {
      const { type, id, data } = args;
      try {
        const item = await callWordPressAPI(`/${type}/${id}`, "PUT", data);
        return Responses.success(item, `✅ Updated ${type} ${id}`);
      } catch (error: any) {
        return Responses.error(`Failed to update ${type}: ${error.message}`);
      }
    },
    {
      description: "Update a custom post type item",
      schema: { type: "string", id: "number", data: "object" },
    }
  );

  server.tool(
    "wordpress_delete_cpt",
    async (args: any) => {
      const { type, id, force = false } = args;
      try {
        const endpoint = force ? `/${type}/${id}?force=true` : `/${type}/${id}`;
        await callWordPressAPI(endpoint, "DELETE");
        return Responses.success({ type, id, deleted: true }, `🗑️ Deleted ${type} ${id}`);
      } catch (error: any) {
        return Responses.error(`Failed to delete ${type}: ${error.message}`);
      }
    },
    {
      description: "Delete a custom post type item",
      schema: { 
        type: "string",        // Required: Custom post type name
        id: "number",          // Required: Item ID to delete
        force: "boolean?"      // Optional: Force delete (default: false)
      },
    }
  );

  // ========== WOO COMMERCE ==========
  server.tool(
    "woocommerce_get_products",
    async (args: any) => {
      const { perPage = 20, page = 1, search } = args || {};
      try {
        const params = new URLSearchParams({
          per_page: String(perPage),
          page: String(page),
        });
        if (search) params.append("search", search);
        const products = await callWooCommerceAPI(`/products?${params.toString()}`);
        return Responses.success(
          { products, count: products.length },
          `🛒 Retrieved ${products.length} products`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get products: ${error.message}`);
      }
    },
    {
      description: "Get WooCommerce products",
      schema: { 
        perPage: "number?",    // Optional: Results per page (default: 20)
        page: "number?",       // Optional: Page number (default: 1)
        search: "string?"      // Optional: Search term
      },
    }
  );

  server.tool(
    "woocommerce_create_product",
    async (args: any) => {
      try {
        // Ensure price fields are strings (WooCommerce API requirement)
        const productData = { ...args };
        if (productData.regular_price !== undefined) {
          productData.regular_price = String(productData.regular_price);
        }
        if (productData.sale_price !== undefined) {
          productData.sale_price = String(productData.sale_price);
        }
        const product = await callWooCommerceAPI(`/products`, "POST", productData);
        return Responses.success(product, `✅ Created product: ${product.name}`);
      } catch (error: any) {
        return Responses.error(`Failed to create product: ${error.message}`);
      }
    },
    { 
      description: "Create WooCommerce product", 
      schema: {
        name: "string",        // Required: Product name
        type: "string?",       // Optional: 'simple', 'variable', etc. (default: 'simple')
        regular_price: "string?", // Optional: Regular price
        description: "string?", // Optional: Product description
        short_description: "string?", // Optional: Short description
        categories: "array?",  // Optional: Array of category objects
        images: "array?"       // Optional: Array of image objects
      } 
    }
  );

  server.tool(
    "woocommerce_update_product",
    async (args: any) => {
      const { id, updates } = args;
      try {
        // Ensure price fields are strings (WooCommerce API requirement)
        const productUpdates = { ...updates };
        if (productUpdates.regular_price !== undefined) {
          productUpdates.regular_price = String(productUpdates.regular_price);
        }
        if (productUpdates.sale_price !== undefined) {
          productUpdates.sale_price = String(productUpdates.sale_price);
        }
        const product = await callWooCommerceAPI(`/products/${id}`, "PUT", productUpdates);
        return Responses.success(product, `✅ Updated product ${id}`);
      } catch (error: any) {
        return Responses.error(`Failed to update product: ${error.message}`);
      }
    },
    {
      description: "Update WooCommerce product",
      schema: { id: "number", updates: "object" },
    }
  );

  server.tool(
    "woocommerce_delete_product",
    async (args: any) => {
      const { id, force = true } = args || {};
      try {
        const product = await callWooCommerceAPI(
          `/products/${id}?force=${force ? "true" : "false"}`,
          "DELETE"
        );
        return Responses.success(product, `🗑️ Deleted product ${id}`);
      } catch (error: any) {
        return Responses.error(`Failed to delete product: ${error.message}`);
      }
    },
    {
      description: "Delete WooCommerce product",
      schema: { 
        id: "number",          // Required: Product ID to delete
        force: "boolean?"      // Optional: Permanently delete (default: true)
      },
    }
  );

  // ========== REACT PAGE HELPER ==========
  server.tool(
    "wordpress_create_react_page",
    async (args: any) => {
      const { title, componentUrl, componentName, props = {}, status = "publish" } = args;
      try {
        const content = `
<div id="react-root"></div>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="${componentUrl}"></script>
<script>
  const root = ReactDOM.createRoot(document.getElementById('react-root'));
  root.render(React.createElement(window['${componentName}'], ${JSON.stringify(props)}));
</script>
`;
        const page = await callWordPressAPI("/pages", "POST", { title, content, status });
        return Responses.success(page, `✅ Created React page: ${title}`);
      } catch (error: any) {
        return Responses.error(`Failed to create React page: ${error.message}`);
      }
    },
    {
      description: "Create a WordPress page that mounts an external React component",
      schema: {
        title: "string",       // Required: Page title
        componentUrl: "string", // Required: URL to React component bundle
        componentName: "string", // Required: Window-exported component name
        props: "object?",      // Optional: Props to pass to component
        status: "string?"      // Optional: 'publish', 'draft' (default: 'publish')
      },
    }
  );
}

