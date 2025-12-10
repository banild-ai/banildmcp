/**
 * WordPress All Features Tools
 * Users, Taxonomy, Comments, Site Management, Plugins, Themes, Settings
 */
import { Responses } from "quickmcp-sdk";
import { callWordPressAPI, callWordPressRootAPI, callWooCommerceAPI, searchWordPressOrgPlugins, } from "../utils/api.js";
import { formatUser, formatComment, buildQueryString } from "../utils/helpers.js";
export function registerAllFeatureTools(server) {
    // ========== USERS ==========
    server.tool("wordpress_create_user", async (args) => {
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
        }
        catch (error) {
            return Responses.error(`Failed to create user: ${error.message}`);
        }
    }, {
        description: "Create a new WordPress user with roles",
        schema: { username: "string", email: "string", password: "string" },
    });
    server.tool("wordpress_get_users", async (args) => {
        const { perPage = 10, page = 1, roles, search } = args;
        try {
            const params = { per_page: perPage, page };
            if (roles)
                params.roles = roles;
            if (search)
                params.search = search;
            const queryString = buildQueryString(params);
            const users = await callWordPressAPI(`/users?${queryString}`);
            return Responses.success({ users: users.map(formatUser), count: users.length }, `👥 Retrieved ${users.length} users`);
        }
        catch (error) {
            return Responses.error(`Failed to get users: ${error.message}`);
        }
    }, {
        description: "Get WordPress users with role filtering",
        schema: { perPage: "number", page: "number" },
    });
    server.tool("wordpress_update_user", async (args) => {
        const { userId, updates } = args;
        try {
            const user = await callWordPressAPI(`/users/${userId}`, "PUT", updates);
            return Responses.success(formatUser(user), `✅ Updated user ID ${userId}`);
        }
        catch (error) {
            return Responses.error(`Failed to update user: ${error.message}`);
        }
    }, {
        description: "Update user information (name, email, roles, password)",
        schema: { userId: "number", updates: "object" },
    });
    server.tool("wordpress_delete_user", async (args) => {
        const { userId, reassign } = args;
        try {
            const endpoint = reassign
                ? `/users/${userId}?reassign=${reassign}&force=true`
                : `/users/${userId}?force=true`;
            await callWordPressAPI(endpoint, "DELETE");
            return Responses.success({ id: userId, deleted: true }, `✅ Deleted user ID ${userId}`);
        }
        catch (error) {
            return Responses.error(`Failed to delete user: ${error.message}`);
        }
    }, {
        description: "Delete a user (reassign their content to another user)",
        schema: { userId: "number", reassign: "number" },
    });
    // ========== CATEGORIES ==========
    server.tool("wordpress_create_category", async (args) => {
        const { name, description = "", parent = 0, slug } = args;
        try {
            const categoryData = { name, description, parent };
            if (slug)
                categoryData.slug = slug;
            const category = await callWordPressAPI("/categories", "POST", categoryData);
            return Responses.success({ id: category.id, name: category.name, slug: category.slug, parent: category.parent }, `✅ Created category: "${name}"`);
        }
        catch (error) {
            return Responses.error(`Failed to create category: ${error.message}`);
        }
    }, {
        description: "Create a new category with hierarchical support",
        schema: { name: "string" },
    });
    server.tool("wordpress_get_categories", async (args) => {
        const { perPage = 100, parent, hideEmpty = false } = args || {};
        try {
            const params = { per_page: perPage, hide_empty: hideEmpty };
            if (parent !== undefined)
                params.parent = parent;
            const queryString = buildQueryString(params);
            const categories = await callWordPressAPI(`/categories?${queryString}`);
            return Responses.success({
                categories: categories.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    count: cat.count,
                    parent: cat.parent,
                })),
                total: categories.length,
            }, `📁 Retrieved ${categories.length} categories`);
        }
        catch (error) {
            return Responses.error(`Failed to get categories: ${error.message}`);
        }
    }, {
        description: "Get all categories with hierarchy",
        schema: {},
    });
    server.tool("wordpress_update_category", async (args) => {
        const { categoryId, updates } = args;
        try {
            const category = await callWordPressAPI(`/categories/${categoryId}`, "PUT", updates);
            return Responses.success({ id: category.id, name: category.name }, `✅ Updated category ID ${categoryId}`);
        }
        catch (error) {
            return Responses.error(`Failed to update category: ${error.message}`);
        }
    }, {
        description: "Update category name, description, or parent",
        schema: { categoryId: "number", updates: "object" },
    });
    server.tool("wordpress_delete_category", async (args) => {
        const { categoryId, force = false } = args;
        try {
            const endpoint = force
                ? `/categories/${categoryId}?force=true`
                : `/categories/${categoryId}`;
            await callWordPressAPI(endpoint, "DELETE");
            return Responses.success({ id: categoryId, deleted: true }, `✅ Deleted category ID ${categoryId}`);
        }
        catch (error) {
            return Responses.error(`Failed to delete category: ${error.message}`);
        }
    }, {
        description: "Delete a category",
        schema: { categoryId: "number", force: "boolean" },
    });
    // ========== TAGS ==========
    server.tool("wordpress_create_tag", async (args) => {
        const { name, description = "", slug } = args;
        try {
            const tagData = { name, description };
            if (slug)
                tagData.slug = slug;
            const tag = await callWordPressAPI("/tags", "POST", tagData);
            return Responses.success({ id: tag.id, name: tag.name, slug: tag.slug }, `✅ Created tag: "${name}"`);
        }
        catch (error) {
            return Responses.error(`Failed to create tag: ${error.message}`);
        }
    }, {
        description: "Create a new tag",
        schema: { name: "string" },
    });
    server.tool("wordpress_get_tags", async (args) => {
        const { perPage = 100, hideEmpty = false } = args || {};
        try {
            const params = { per_page: perPage, hide_empty: hideEmpty };
            const queryString = buildQueryString(params);
            const tags = await callWordPressAPI(`/tags?${queryString}`);
            return Responses.success({
                tags: tags.map((tag) => ({
                    id: tag.id,
                    name: tag.name,
                    slug: tag.slug,
                    count: tag.count,
                })),
                total: tags.length,
            }, `🏷️ Retrieved ${tags.length} tags`);
        }
        catch (error) {
            return Responses.error(`Failed to get tags: ${error.message}`);
        }
    }, {
        description: "Get all tags",
        schema: {},
    });
    // ========== COMMENTS ==========
    server.tool("wordpress_create_comment", async (args) => {
        const { postId, content, author, authorEmail } = args;
        try {
            const commentData = { post: postId, content };
            if (author)
                commentData.author_name = author;
            if (authorEmail)
                commentData.author_email = authorEmail;
            const comment = await callWordPressAPI("/comments", "POST", commentData);
            return Responses.success(formatComment(comment), `✅ Created comment on post ${postId}`);
        }
        catch (error) {
            return Responses.error(`Failed to create comment: ${error.message}`);
        }
    }, {
        description: "Create a comment on a post",
        schema: { postId: "number", content: "string" },
    });
    server.tool("wordpress_get_comments", async (args) => {
        const { postId, perPage = 10, status = "approve" } = args;
        try {
            const params = { per_page: perPage, status };
            if (postId)
                params.post = postId;
            const queryString = buildQueryString(params);
            const comments = await callWordPressAPI(`/comments?${queryString}`);
            return Responses.success({ comments: comments.map(formatComment), count: comments.length }, `💬 Retrieved ${comments.length} comments`);
        }
        catch (error) {
            return Responses.error(`Failed to get comments: ${error.message}`);
        }
    }, {
        description: "Get comments with filtering by post and status",
        schema: { perPage: "number" },
    });
    server.tool("wordpress_update_comment", async (args) => {
        const { commentId, status, content } = args;
        try {
            const updates = {};
            if (status)
                updates.status = status;
            if (content)
                updates.content = content;
            const comment = await callWordPressAPI(`/comments/${commentId}`, "PUT", updates);
            return Responses.success(formatComment(comment), `✅ Updated comment ID ${commentId}`);
        }
        catch (error) {
            return Responses.error(`Failed to update comment: ${error.message}`);
        }
    }, {
        description: "Update comment (approve, spam, trash, edit content)",
        schema: { commentId: "number" },
    });
    server.tool("wordpress_delete_comment", async (args) => {
        const { commentId, force = false } = args;
        try {
            const endpoint = force
                ? `/comments/${commentId}?force=true`
                : `/comments/${commentId}`;
            await callWordPressAPI(endpoint, "DELETE");
            return Responses.success({ id: commentId, deleted: true }, `✅ Deleted comment ID ${commentId}`);
        }
        catch (error) {
            return Responses.error(`Failed to delete comment: ${error.message}`);
        }
    }, {
        description: "Delete a comment",
        schema: { commentId: "number", force: "boolean" },
    });
    // ========== SITE & SETTINGS ==========
    server.tool("wordpress_get_site_info", async () => {
        try {
            const siteInfo = await callWordPressRootAPI();
            return Responses.success({
                name: siteInfo.name,
                description: siteInfo.description,
                url: siteInfo.url,
                homeUrl: siteInfo.home,
                gmtOffset: siteInfo.gmt_offset,
                timezoneString: siteInfo.timezone_string,
                namespaces: siteInfo.namespaces,
                authentication: siteInfo.authentication,
                routes: Object.keys(siteInfo.routes || {}),
            }, `ℹ️ Site: ${siteInfo.name}`);
        }
        catch (error) {
            return Responses.error(`Failed to get site info: ${error.message}`);
        }
    }, {
        description: "Get complete WordPress site information including available API routes",
        schema: {},
    });
    server.tool("wordpress_test_connection", async () => {
        try {
            const user = await callWordPressAPI("/users/me");
            return Responses.success({ connected: true, user: formatUser(user) }, `✅ Connected as ${user.name}`);
        }
        catch (error) {
            return Responses.error(`Connection test failed: ${error.message}`);
        }
    }, {
        description: "Test WordPress connection and authentication",
        schema: {},
    });
    server.tool("wordpress_get_settings", async () => {
        try {
            const settings = await callWordPressAPI("/settings");
            return Responses.success({
                title: settings.title,
                description: settings.description,
                url: settings.url,
                email: settings.email,
                timezone: settings.timezone,
                dateFormat: settings.date_format,
                timeFormat: settings.time_format,
                language: settings.language,
                postsPerPage: settings.posts_per_page,
            }, `⚙️ Retrieved site settings`);
        }
        catch (error) {
            return Responses.error(`Failed to get settings: ${error.message}`);
        }
    }, {
        description: "Get WordPress site settings",
        schema: {},
    });
    server.tool("wordpress_update_settings", async (args) => {
        try {
            const settings = await callWordPressAPI("/settings", "PUT", args);
            return Responses.success(settings, `✅ Updated site settings`);
        }
        catch (error) {
            return Responses.error(`Failed to update settings: ${error.message}`);
        }
    }, {
        description: "Update site settings (title, description, timezone, etc)",
        schema: {},
    });
    server.tool("wordpress_get_plugins", async () => {
        try {
            const plugins = await callWordPressAPI("/plugins");
            return Responses.success({
                plugins: plugins.map((plugin) => ({
                    plugin: plugin.plugin,
                    status: plugin.status,
                    name: plugin.name,
                    version: plugin.version,
                    author: plugin.author,
                    description: plugin.description?.rendered || "",
                })),
                total: plugins.length,
            }, `🔌 Retrieved ${plugins.length} plugins`);
        }
        catch (error) {
            return Responses.error(`Failed to get plugins: ${error.message}`);
        }
    }, {
        description: "Get all installed WordPress plugins",
        schema: {},
    });
    server.tool("wordpress_install_plugin", async (args) => {
        const { slug, zipUrl, activate = false } = args || {};
        try {
            if (!slug && !zipUrl) {
                return Responses.error("Provide either slug or zipUrl");
            }
            const payload = {};
            if (slug)
                payload.slug = slug;
            if (zipUrl) {
                payload.source_url = zipUrl;
                payload.zip_url = zipUrl;
            }
            if (activate === true)
                payload.status = "active";
            const result = await callWordPressAPI("/plugins", "POST", payload);
            const msgParts = ["🔌 Plugin installation complete"];
            if (slug)
                msgParts.push(`slug: ${slug}`);
            if (activate === true || result?.status === "active")
                msgParts.push("activated");
            return Responses.success(result, msgParts.join(" · "));
        }
        catch (error) {
            return Responses.error(`Failed to install plugin: ${error.message}`);
        }
    }, {
        description: "Install a plugin by WordPress.org slug or by zip URL. Optionally activate after install.",
        schema: { slug: "string", zipUrl: "string", activate: "boolean" },
    });
    server.tool("wordpress_activate_plugin", async (args) => {
        const { pluginFile, slug } = args || {};
        try {
            let targetPlugin = pluginFile;
            if (!targetPlugin && slug) {
                const plugins = await callWordPressAPI("/plugins");
                const match = plugins.find((p) => typeof p?.plugin === "string" && p.plugin.startsWith(`${slug}/`));
                if (match)
                    targetPlugin = match.plugin;
            }
            if (!targetPlugin) {
                return Responses.error("Provide pluginFile (e.g., 'akismet/akismet.php') or a valid slug");
            }
            const updated = await callWordPressAPI(`/plugins/${encodeURIComponent(targetPlugin)}`, "PUT", { status: "active" });
            return Responses.success({ plugin: targetPlugin, status: updated?.status || "active" }, `✅ Activated plugin ${targetPlugin}`);
        }
        catch (error) {
            return Responses.error(`Failed to activate plugin: ${error.message}`);
        }
    }, {
        description: "Activate an installed plugin. Provide pluginFile or slug to resolve it.",
        schema: { pluginFile: "string", slug: "string" },
    });
    server.tool("wordpress_search_plugins", async (args) => {
        const { query, page = 1, perPage = 10 } = args || {};
        try {
            if (!query)
                return Responses.error("Query is required");
            const results = await searchWordPressOrgPlugins(query, page, perPage);
            return Responses.success({ results, count: results.length, page, perPage }, `🔍 Found ${results.length} plugins for "${query}"`);
        }
        catch (error) {
            return Responses.error(`Failed to search plugins: ${error.message}`);
        }
    }, {
        description: "Search WordPress.org plugin directory by keyword",
        schema: { query: "string", page: "number", perPage: "number" },
    });
    server.tool("wordpress_get_themes", async () => {
        try {
            const themes = await callWordPressAPI("/themes");
            return Responses.success({
                themes: themes.map((theme) => ({
                    stylesheet: theme.stylesheet,
                    name: theme.name?.rendered || theme.stylesheet,
                    version: theme.version,
                    author: theme.author,
                    status: theme.status,
                })),
                total: themes.length,
            }, `🎨 Retrieved ${themes.length} themes`);
        }
        catch (error) {
            return Responses.error(`Failed to get themes: ${error.message}`);
        }
    }, {
        description: "Get all installed WordPress themes",
        schema: {},
    });
    // SEO Meta
    server.tool("wordpress_set_seo_meta", async (args) => {
        const { postId, productId, metaDescription, focusKeyword, canonicalUrl, ogTitle, ogDescription, twitterTitle, twitterDescription, } = args;
        if (!postId && !productId) {
            return Responses.error("Provide either postId or productId");
        }
        try {
            const meta = {};
            if (metaDescription)
                meta._yoast_wpseo_metadesc = metaDescription;
            if (focusKeyword)
                meta._yoast_wpseo_focuskw = focusKeyword;
            if (canonicalUrl)
                meta._yoast_wpseo_canonical = canonicalUrl;
            if (ogTitle)
                meta["_yoast_wpseo_opengraph-title"] = ogTitle;
            if (ogDescription)
                meta["_yoast_wpseo_opengraph-description"] = ogDescription;
            if (twitterTitle)
                meta["_yoast_wpseo_twitter-title"] = twitterTitle;
            if (twitterDescription)
                meta["_yoast_wpseo_twitter-description"] = twitterDescription;
            if (productId) {
                const meta_data = Object.entries(meta).map(([key, value]) => ({ key, value }));
                await callWooCommerceAPI(`/products/${productId}`, "PUT", { meta_data });
                return Responses.success({ productId, metaFieldsSet: Object.keys(meta) }, `✅ Set SEO metadata for product ${productId}`);
            }
            await callWordPressAPI(`/posts/${postId}`, "PUT", { meta });
            return Responses.success({ postId, metaFieldsSet: Object.keys(meta) }, `✅ Set SEO metadata for post ${postId}`);
        }
        catch (error) {
            return Responses.error(`Failed to set SEO meta: ${error.message}`);
        }
    }, {
        description: "Set SEO metadata for posts and WooCommerce products (Yoast/Rank Math/AIOSEO)",
        schema: { postId: "number?" },
    });
    server.tool("wordpress_set_custom_meta", async (args) => {
        const { postId, metaKey, metaValue } = args;
        try {
            const meta = {};
            meta[metaKey] = metaValue;
            await callWordPressAPI(`/posts/${postId}`, "PUT", { meta });
            return Responses.success({ postId, metaKey, metaValue, set: true }, `✅ Set custom meta "${metaKey}" for post ${postId}`);
        }
        catch (error) {
            return Responses.error(`Failed to set custom meta: ${error.message}`);
        }
    }, {
        description: "Set custom post metadata field - useful for custom fields and plugins",
        schema: { postId: "number", metaKey: "string", metaValue: "string" },
    });
    // ========== GENERIC CUSTOM POST TYPES ==========
    server.tool("wordpress_get_cpt", async (args) => {
        const { type, params = {} } = args;
        try {
            const query = buildQueryString(params);
            const items = await callWordPressAPI(`/${type}${query ? `?${query}` : ""}`);
            return Responses.success({ items, count: items.length, type }, `📦 Retrieved ${items.length} from ${type}`);
        }
        catch (error) {
            return Responses.error(`Failed to get ${type}: ${error.message}`);
        }
    }, {
        description: "Get custom post type items",
        schema: { type: "string", params: "object" },
    });
    server.tool("wordpress_create_cpt", async (args) => {
        const { type, data } = args;
        try {
            const item = await callWordPressAPI(`/${type}`, "POST", data);
            return Responses.success(item, `✅ Created ${type} item`);
        }
        catch (error) {
            return Responses.error(`Failed to create ${type}: ${error.message}`);
        }
    }, {
        description: "Create a custom post type item",
        schema: { type: "string", data: "object" },
    });
    server.tool("wordpress_update_cpt", async (args) => {
        const { type, id, data } = args;
        try {
            const item = await callWordPressAPI(`/${type}/${id}`, "PUT", data);
            return Responses.success(item, `✅ Updated ${type} ${id}`);
        }
        catch (error) {
            return Responses.error(`Failed to update ${type}: ${error.message}`);
        }
    }, {
        description: "Update a custom post type item",
        schema: { type: "string", id: "number", data: "object" },
    });
    server.tool("wordpress_delete_cpt", async (args) => {
        const { type, id, force = false } = args;
        try {
            const endpoint = force ? `/${type}/${id}?force=true` : `/${type}/${id}`;
            await callWordPressAPI(endpoint, "DELETE");
            return Responses.success({ type, id, deleted: true }, `🗑️ Deleted ${type} ${id}`);
        }
        catch (error) {
            return Responses.error(`Failed to delete ${type}: ${error.message}`);
        }
    }, {
        description: "Delete a custom post type item",
        schema: { type: "string", id: "number", force: "boolean" },
    });
    // ========== WOO COMMERCE ==========
    server.tool("woocommerce_get_products", async (args) => {
        const { perPage = 20, page = 1, search } = args || {};
        try {
            const params = new URLSearchParams({
                per_page: String(perPage),
                page: String(page),
            });
            if (search)
                params.append("search", search);
            const products = await callWooCommerceAPI(`/products?${params.toString()}`);
            return Responses.success({ products, count: products.length }, `🛒 Retrieved ${products.length} products`);
        }
        catch (error) {
            return Responses.error(`Failed to get products: ${error.message}`);
        }
    }, {
        description: "Get WooCommerce products",
        schema: { perPage: "number", page: "number", search: "string" },
    });
    server.tool("woocommerce_create_product", async (args) => {
        try {
            const product = await callWooCommerceAPI(`/products`, "POST", args);
            return Responses.success(product, `✅ Created product: ${product.name}`);
        }
        catch (error) {
            return Responses.error(`Failed to create product: ${error.message}`);
        }
    }, { description: "Create WooCommerce product", schema: {} });
    server.tool("woocommerce_update_product", async (args) => {
        const { id, updates } = args;
        try {
            const product = await callWooCommerceAPI(`/products/${id}`, "PUT", updates);
            return Responses.success(product, `✅ Updated product ${id}`);
        }
        catch (error) {
            return Responses.error(`Failed to update product: ${error.message}`);
        }
    }, {
        description: "Update WooCommerce product",
        schema: { id: "number", updates: "object" },
    });
    server.tool("woocommerce_delete_product", async (args) => {
        const { id, force = true } = args || {};
        try {
            const product = await callWooCommerceAPI(`/products/${id}?force=${force ? "true" : "false"}`, "DELETE");
            return Responses.success(product, `🗑️ Deleted product ${id}`);
        }
        catch (error) {
            return Responses.error(`Failed to delete product: ${error.message}`);
        }
    }, {
        description: "Delete WooCommerce product",
        schema: { id: "number", force: "boolean" },
    });
    // ========== REACT PAGE HELPER ==========
    server.tool("wordpress_create_react_page", async (args) => {
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
        }
        catch (error) {
            return Responses.error(`Failed to create React page: ${error.message}`);
        }
    }, {
        description: "Create a WordPress page that mounts an external React component",
        schema: {
            title: "string",
            componentUrl: "string",
            componentName: "string",
            props: "object",
            status: "string",
        },
    });
}
//# sourceMappingURL=all-features.js.map