# BanildMCP - WordPress MCP Server

[![npm version](https://badge.fury.io/js/banildmcp.svg)](https://www.npmjs.com/package/banildmcp)

A comprehensive MCP (Model Context Protocol) server for WordPress management with **54+ core tools** (77 with BanildTools plugin) for complete site management through AI assistants like Claude.

## 🚀 What's New in v2.1.0

**Dynamic Tool Loading** - The MCP server now automatically detects whether the BanildTools WordPress plugin is installed:

- ✅ **Without BanildTools**: All core WordPress REST API tools work (posts, pages, media, users, comments, settings, plugins, themes, WooCommerce, SEO, etc.)
- ✅ **With BanildTools**: Additional 23 file operation and server management tools become available

This means users who don't have the BanildTools plugin can still use the MCP server for standard WordPress management!

### BanildTools Features (when plugin is installed)

- 📄 **Read/Write/Append files** with line range support
- 🔄 **Edit files** with search & replace
- 🗑️ **Delete files** and directories
- 📁 **List directories** with filtering
- 🔍 **Grep search** - regex pattern matching across files
- 📂 **Glob search** - find files by pattern
- 📁 **Create directories** recursively
- 📝 **Rename/move** files and directories
- 📋 **Copy** files and directories
- ⚙️ **WordPress Options** - get, set, delete options and transients
- 🗄️ **Database queries** - read-only SELECT queries
- 🔧 **Server tools** - PHP lint, cache clear, debug log, server info

> **Note**: File operations require the [BanildTools WordPress plugin](https://github.com/banild-ai/banildtools) to be installed and active.

## 📦 Installation

```bash
npm install -g banildmcp
```

Or use with npx:

```bash
npx banildmcp
```

## ⚙️ Configuration

Set environment variables:

```bash
export WORDPRESS_URL="https://your-site.com"
export WORDPRESS_USERNAME="your-username"
export WORDPRESS_PASSWORD="xxxx xxxx xxxx xxxx"  # Application Password

# Optional: WooCommerce credentials
export WC_CONSUMER_KEY="ck_..."
export WC_CONSUMER_SECRET="cs_..."
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "banildmcp": {
      "command": "npx",
      "args": ["-y", "banildmcp"],
      "env": {
        "WORDPRESS_URL": "https://your-site.com",
        "WORDPRESS_USERNAME": "your-username",
        "WORDPRESS_PASSWORD": "xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

## 🔧 Available Tools

### Core Tools (54 - Always Available)

### 📝 Posts (15 tools)

- `wordpress_create_post` - Create new posts
- `wordpress_update_post` - Update existing posts
- `wordpress_delete_post` - Delete posts (trash or permanent)
- `wordpress_get_posts` - List posts with filtering
- `wordpress_get_post` - Get single post details
- `wordpress_search_posts` - Search posts by keyword
- `wordpress_schedule_post` - Schedule for future publication
- `wordpress_publish_post` - Publish immediately
- `wordpress_duplicate_post` - Clone a post
- `wordpress_get_post_revisions` - View edit history
- `wordpress_bulk_create_posts` - Batch create
- `wordpress_bulk_update_posts` - Batch update
- `wordpress_bulk_delete_posts` - Batch delete

### 📄 Pages (4 tools)

- `wordpress_create_page` - Create pages with hierarchy
- `wordpress_update_page` - Update pages
- `wordpress_get_pages` - List pages
- `wordpress_delete_page` - Delete pages

### 🖼️ Media (5 tools)

- `wordpress_upload_media` - Upload from base64 or URL
- `wordpress_get_media` - List media library
- `wordpress_update_media` - Update metadata
- `wordpress_delete_media` - Remove from library
- `wordpress_set_featured_image` - Set post thumbnail

### 👥 Users (4 tools)

- `wordpress_create_user` - Create with roles
- `wordpress_get_users` - List with filtering
- `wordpress_update_user` - Update user data
- `wordpress_delete_user` - Delete with content reassignment

### 📁 Categories (4 tools)

- `wordpress_create_category` - Create with hierarchy
- `wordpress_get_categories` - List all
- `wordpress_update_category` - Update
- `wordpress_delete_category` - Delete

### 🏷️ Tags (2 tools)

- `wordpress_create_tag` - Create tags
- `wordpress_get_tags` - List tags

### 💬 Comments (4 tools)

- `wordpress_create_comment` - Add comments
- `wordpress_get_comments` - List with filtering
- `wordpress_update_comment` - Moderate/edit
- `wordpress_delete_comment` - Remove

### ⚙️ Site Management (6 tools)

- `wordpress_get_site_info` - Site information & routes
- `wordpress_test_connection` - Test authentication
- `wordpress_get_settings` - Get site settings
- `wordpress_update_settings` - Update settings
- `wordpress_get_plugins` - List installed plugins
- `wordpress_get_themes` - List installed themes

### 🔌 Plugin Management (3 tools)

- `wordpress_install_plugin` - Install by slug or URL
- `wordpress_activate_plugin` - Activate plugins
- `wordpress_search_plugins` - Search WordPress.org

### 🔍 SEO & Meta (2 tools)

- `wordpress_set_seo_meta` - Yoast/Rank Math/AIOSEO support
- `wordpress_set_custom_meta` - Custom post meta

### 📦 Custom Post Types (4 tools)

- `wordpress_get_cpt` - Get CPT items
- `wordpress_create_cpt` - Create CPT items
- `wordpress_update_cpt` - Update CPT items
- `wordpress_delete_cpt` - Delete CPT items

### 🛒 WooCommerce (4 tools)

- `woocommerce_get_products` - List products
- `woocommerce_create_product` - Create products
- `woocommerce_update_product` - Update products
- `woocommerce_delete_product` - Delete products

### ⚛️ React Integration (1 tool)

- `wordpress_create_react_page` - Create pages with React components

### 📂 BanildTools Extended Tools (23 tools) - Requires Plugin

> These tools are **dynamically loaded** only when [BanildTools WordPress plugin](https://github.com/banild-ai/banildtools) is detected

#### File Operations (12 tools)

- `banildtools_read_file` - Read file contents with optional line range
- `banildtools_write_file` - Create or overwrite files
- `banildtools_append_file` - Append content to files (for large files)
- `banildtools_edit_file` - Search and replace in files
- `banildtools_delete_file` - Delete files or directories
- `banildtools_list_dir` - List directory contents
- `banildtools_file_info` - Get detailed file/directory info
- `banildtools_grep` - Search for patterns in files (regex)
- `banildtools_glob_search` - Find files matching glob pattern
- `banildtools_mkdir` - Create directories
- `banildtools_rename` - Rename or move files/directories
- `banildtools_copy` - Copy files/directories

#### WordPress Options & Transients (6 tools)

- `banildtools_get_option` - Get WordPress option value
- `banildtools_set_option` - Set WordPress option
- `banildtools_delete_option` - Delete WordPress option
- `banildtools_get_transient` - Get transient value
- `banildtools_set_transient` - Set transient with expiration
- `banildtools_delete_transient` - Delete transient

#### Server & Database Tools (5 tools)

- `banildtools_debug_log` - Read, tail, or clear debug.log
- `banildtools_php_lint` - Check PHP syntax for errors
- `banildtools_clear_cache` - Clear WordPress caches
- `banildtools_server_info` - Get comprehensive server info
- `banildtools_db_query` - Execute read-only SELECT queries

## 🔐 Authentication

Uses WordPress Application Passwords:

1. Go to WordPress admin: **Users → Your Profile**
2. Scroll to **Application Passwords**
3. Create a new application password
4. Use with your username for `WORDPRESS_PASSWORD`

## 📋 Examples

### Create a Blog Post

```
Create a new blog post titled "AI in 2025" with content about artificial intelligence trends. Schedule it for next Monday at 9 AM.
```

### Manage Media

```
Upload this image URL to WordPress and set it as the featured image for post ID 42.
```

### File Operations (requires BanildTools plugin)

```
Read the contents of wp-content/themes/mytheme/functions.php

Search for all PHP files containing "add_action" in the plugins directory

Create a new file at wp-content/plugins/myplugin/custom.php with this content: <?php // Custom code

Get the WordPress site URL option value

Execute a SQL query to count all published posts
```

### WooCommerce

```
List all products under $50 and update their prices by 10%.
```

## 🛠️ BanildTools Plugin Setup

To use file operations, install the BanildTools WordPress plugin:

1. Download from [releases](https://github.com/banild-ai/banildtools/releases) or install manually
2. Activate in WordPress admin
3. Configure allowed paths in **Settings → BanildTools**
4. Enable write/delete operations as needed

Security features:

- Path restrictions to allowed directories
- Blocked file extensions
- Separate write/delete permission toggles
- Admin-only access

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/banild-ai/banildmcp).

## 👤 Author

**Banild.Ai**

---

Made with ❤️ for the WordPress & AI community
