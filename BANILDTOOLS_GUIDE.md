# BanildTools MCP Guide for AI Agents

This guide teaches AI agents how to correctly use the 21 BanildTools MCP tools for WordPress server file operations and management.

> **Important**: All paths are relative to WordPress root (ABSPATH) unless absolute paths are provided.

---

## 📁 FILE OPERATIONS

### 1. `banildtools_read_file`
**Purpose**: Read file contents from WordPress server.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_file` | string | ✅ | Path to file (relative to WP root or absolute) |
| `offset` | number | ❌ | Line number to start reading from (1-based) |
| `limit` | number | ❌ | Maximum number of lines to read |

**Example Usage**:
```
# Read entire file
banildtools_read_file({ target_file: "wp-config.php" })

# Read lines 10-50 of a large file
banildtools_read_file({ target_file: "wp-content/debug.log", offset: 10, limit: 40 })

# Read a plugin file
banildtools_read_file({ target_file: "wp-content/plugins/myplugin/myplugin.php" })
```

**Returns**: `{ path, contents, size, total_lines, mime_type, is_binary, is_image, contents_base64 }`

**Tips**:
- For large files, use `offset` and `limit` to read in chunks
- Images return `contents_base64` instead of text content
- Binary files have `is_binary: true`

---

### 2. `banildtools_write_file`
**Purpose**: Create or overwrite a file. Creates parent directories automatically.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | ✅ | Path to file |
| `contents` | string | ✅ | File contents to write |

**Example Usage**:
```
# Create a new PHP file
banildtools_write_file({
  file_path: "wp-content/plugins/myplugin/custom.php",
  contents: "<?php\n// Custom code\nfunction my_function() {\n    return 'Hello';\n}\n"
})

# Create a CSS file
banildtools_write_file({
  file_path: "wp-content/themes/mytheme/custom.css",
  contents: "body { background: #fff; }"
})
```

**Returns**: `{ path, bytes_written }`

**Tips**:
- Parent directories are created automatically
- This OVERWRITES existing files - use `banildtools_edit_file` for modifications
- Requires write permission enabled in BanildTools settings

---

### 3. `banildtools_append_file`
**Purpose**: Append content to end of file. Use for large files to avoid timeouts.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | ✅ | Path to file |
| `contents` | string | ✅ | Content to append |

**Example Usage**:
```
# Append to a log file
banildtools_append_file({
  file_path: "wp-content/custom-log.txt",
  contents: "\n[2024-01-15] New log entry"
})

# Build large file in chunks
banildtools_append_file({
  file_path: "wp-content/exports/data.csv",
  contents: "row1,data1,data2\nrow2,data3,data4\n"
})
```

**Returns**: `{ path, bytes_appended }`

**Tips**:
- Use this for writing large files in chunks
- Prevents timeout errors on big writes
- Creates file if it doesn't exist

---

### 4. `banildtools_edit_file`
**Purpose**: Search and replace text in a file.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | ✅ | Path to file |
| `old_string` | string | ✅ | Text to find (must be unique unless using replace_all) |
| `new_string` | string | ✅ | Replacement text |
| `replace_all` | boolean | ❌ | Replace all occurrences (default: false) |

**Example Usage**:
```
# Replace a specific function
banildtools_edit_file({
  file_path: "wp-content/themes/mytheme/functions.php",
  old_string: "function old_name() {",
  new_string: "function new_name() {"
})

# Replace all occurrences of a string
banildtools_edit_file({
  file_path: "wp-content/plugins/myplugin/plugin.php",
  old_string: "http://",
  new_string: "https://",
  replace_all: true
})
```

**Returns**: `{ path, replacements, bytes_written }`

**Tips**:
- Without `replace_all`, the `old_string` MUST be unique in the file
- Include enough context in `old_string` to make it unique
- Use for surgical edits, not full file rewrites

---

### 5. `banildtools_delete_file`
**Purpose**: Delete a file or directory (recursive).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_file` | string | ✅ | Path to file or directory |

**Example Usage**:
```
# Delete a file
banildtools_delete_file({ target_file: "wp-content/uploads/temp.txt" })

# Delete a directory and all contents
banildtools_delete_file({ target_file: "wp-content/plugins/old-plugin" })
```

**Returns**: `{ path, deleted: true }`

**Tips**:
- Directories are deleted recursively (all contents removed)
- Requires delete permission enabled in BanildTools settings
- ⚠️ Use with caution - no undo!

---

### 6. `banildtools_list_dir`
**Purpose**: List directory contents with metadata.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_directory` | string | ✅ | Path to directory |
| `ignore_globs` | array | ❌ | Patterns to ignore (e.g., `["*.log", "cache/*"]`) |

**Example Usage**:
```
# List plugins directory
banildtools_list_dir({ target_directory: "wp-content/plugins" })

# List themes, ignoring cache folders
banildtools_list_dir({
  target_directory: "wp-content/themes",
  ignore_globs: ["*cache*", "*.log"]
})

# List WordPress root
banildtools_list_dir({ target_directory: "." })
```

**Returns**: `{ path, total_items, items: [{ name, type, size, modified, permissions }] }`

**Tips**:
- Returns both files and directories
- Each item includes: name, type (file/dir), size, modified date, permissions
- Use `ignore_globs` to filter out unwanted files

---

### 7. `banildtools_file_info`
**Purpose**: Get detailed information about a file or directory.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ | Path to file or directory |

**Example Usage**:
```
# Get info about wp-config.php
banildtools_file_info({ path: "wp-config.php" })

# Get info about uploads directory
banildtools_file_info({ path: "wp-content/uploads" })
```

**Returns**: `{ path, exists, type, size, permissions, owner, group, modified, accessed, line_count }`

**Tips**:
- Returns `line_count` for text files
- Use to check if a path exists and get metadata
- Works for both files and directories

---

### 8. `banildtools_mkdir`
**Purpose**: Create a directory.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ | Directory path to create |
| `recursive` | boolean | ❌ | Create parent directories (default: true) |

**Example Usage**:
```
# Create nested directories
banildtools_mkdir({ path: "wp-content/uploads/2024/01/images" })

# Create single directory (parent must exist)
banildtools_mkdir({ path: "wp-content/cache", recursive: false })
```

**Returns**: `{ path }`

**Tips**:
- With `recursive: true`, creates all parent directories
- Safe to call on existing directories
- Requires write permission

---

### 9. `banildtools_rename`
**Purpose**: Rename or move a file/directory.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | ✅ | Current path |
| `destination` | string | ✅ | New path |

**Example Usage**:
```
# Rename a file
banildtools_rename({
  source: "wp-content/plugins/old-name.php",
  destination: "wp-content/plugins/new-name.php"
})

# Move a file to different directory
banildtools_rename({
  source: "wp-content/temp/file.txt",
  destination: "wp-content/uploads/file.txt"
})
```

**Returns**: `{ source, destination }`

**Tips**:
- Creates destination directory if needed
- Works for both files and directories
- Effectively a "move" operation

---

### 10. `banildtools_copy`
**Purpose**: Copy a file or directory (recursive).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | ✅ | Source path |
| `destination` | string | ✅ | Destination path |

**Example Usage**:
```
# Copy a file
banildtools_copy({
  source: "wp-content/themes/theme1/style.css",
  destination: "wp-content/themes/theme2/style.css"
})

# Copy entire directory
banildtools_copy({
  source: "wp-content/plugins/myplugin",
  destination: "wp-content/plugins/myplugin-backup"
})
```

**Returns**: `{ source, destination }`

**Tips**:
- Directories are copied recursively
- Creates destination directory if needed
- Useful for backups

---

## 🔍 SEARCH OPERATIONS

### 11. `banildtools_grep`
**Purpose**: Search for regex patterns in files (grep-like).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | ✅ | Regex pattern to search for |
| `path` | string | ❌ | Directory to search in (default: WP root) |
| `glob` | string | ❌ | File pattern filter (e.g., `"*.php"`) |
| `case_insensitive` | boolean | ❌ | Ignore case (default: false) |
| `context_lines` | number | ❌ | Lines of context before/after match (default: 0) |
| `output_mode` | string | ❌ | `"content"`, `"files_with_matches"`, or `"count"` |
| `max_results` | number | ❌ | Max results (default: 500) |

**Example Usage**:
```
# Find all add_action calls in plugins
banildtools_grep({
  pattern: "add_action\\(",
  path: "wp-content/plugins",
  glob: "*.php"
})

# Find database queries with context
banildtools_grep({
  pattern: "\\$wpdb->",
  path: "wp-content/themes/mytheme",
  glob: "*.php",
  context_lines: 2
})

# Case-insensitive search, just list files
banildtools_grep({
  pattern: "error",
  path: "wp-content",
  glob: "*.log",
  case_insensitive: true,
  output_mode: "files_with_matches"
})
```

**Returns**: `{ pattern, path, output_mode, files_searched, files_with_matches, total_matches, truncated, results }`

**Tips**:
- Use `glob` to filter file types (e.g., `"*.php"`, `"*.js"`)
- `output_mode: "files_with_matches"` for just file list
- `output_mode: "count"` for match counts per file
- Escape regex special characters with `\\`

---

### 12. `banildtools_glob_search`
**Purpose**: Find files matching a glob pattern.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `glob_pattern` | string | ✅ | Glob pattern (e.g., `"**/*.php"`) |
| `target_directory` | string | ❌ | Directory to search (default: WP root) |

**Example Usage**:
```
# Find all PHP files
banildtools_glob_search({ glob_pattern: "**/*.php" })

# Find all CSS files in themes
banildtools_glob_search({
  glob_pattern: "**/*.css",
  target_directory: "wp-content/themes"
})

# Find specific named files
banildtools_glob_search({ glob_pattern: "**/functions.php" })
```

**Returns**: `{ pattern, directory, total_files, files }`

**Tips**:
- Results sorted by modification time (newest first)
- Use `**` for recursive search
- Useful for finding files by name pattern

---

## ⚙️ WORDPRESS OPTIONS & TRANSIENTS

### 13. `banildtools_get_option`
**Purpose**: Get WordPress option value.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Option name |

**Example Usage**:
```
# Get site URL
banildtools_get_option({ name: "siteurl" })

# Get blog name
banildtools_get_option({ name: "blogname" })

# Get active plugins list
banildtools_get_option({ name: "active_plugins" })
```

**Returns**: `{ name, value, exists }`

**Common Options**:
- `siteurl` - WordPress address
- `home` - Site address
- `blogname` - Site title
- `blogdescription` - Tagline
- `admin_email` - Admin email
- `active_plugins` - Active plugins array
- `template` - Active theme
- `stylesheet` - Active stylesheet

---

### 14. `banildtools_set_option`
**Purpose**: Set WordPress option value.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Option name |
| `value` | any | ❌ | Value to set (string, number, array, object) |

**Example Usage**:
```
# Set blog description
banildtools_set_option({ name: "blogdescription", value: "My awesome site" })

# Set custom option
banildtools_set_option({ name: "my_plugin_setting", value: { enabled: true, limit: 10 } })
```

**Returns**: `{ name, updated }`

**Tips**:
- Can store strings, numbers, arrays, or objects
- Creates option if it doesn't exist
- ⚠️ Be careful modifying core WordPress options

---

### 15. `banildtools_delete_option`
**Purpose**: Delete WordPress option.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Option name to delete |

**Example Usage**:
```
# Delete a custom option
banildtools_delete_option({ name: "my_plugin_temp_data" })
```

**Returns**: `{ name, deleted }`

---

### 16. `banildtools_get_transient`
**Purpose**: Get WordPress transient (temporary cached value).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Transient name |

**Example Usage**:
```
banildtools_get_transient({ name: "my_cached_data" })
```

**Returns**: `{ name, value, exists }`

---

### 17. `banildtools_set_transient`
**Purpose**: Set WordPress transient with expiration.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Transient name |
| `value` | any | ❌ | Value to store |
| `expiration` | number | ❌ | Seconds until expiration (0 = no expiration) |

**Example Usage**:
```
# Cache data for 1 hour
banildtools_set_transient({
  name: "api_response_cache",
  value: { data: "cached content" },
  expiration: 3600
})

# Cache for 24 hours
banildtools_set_transient({
  name: "daily_stats",
  value: [1, 2, 3],
  expiration: 86400
})
```

**Returns**: `{ name, set, expiration }`

---

### 18. `banildtools_delete_transient`
**Purpose**: Delete WordPress transient.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Transient name |

**Example Usage**:
```
banildtools_delete_transient({ name: "my_cached_data" })
```

**Returns**: `{ name, deleted }`

---

## 🔧 SERVER & DATABASE TOOLS

### 19. `banildtools_debug_log`
**Purpose**: Read, tail, or clear WordPress debug.log.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | ❌ | `"tail"` (default), `"read"`, or `"clear"` |
| `lines` | number | ❌ | Number of lines to return (default: 100) |

**Example Usage**:
```
# Get last 100 lines of debug.log
banildtools_debug_log({})

# Get last 50 lines
banildtools_debug_log({ action: "tail", lines: 50 })

# Clear the debug log
banildtools_debug_log({ action: "clear" })
```

**Returns**: `{ path, exists, size, content, lines_returned }` or `{ cleared }`

**Tips**:
- Use to check for PHP errors
- `tail` gets the most recent entries
- `clear` empties the log file

---

### 20. `banildtools_php_lint`
**Purpose**: Check PHP syntax for errors.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_path` | string | ❌ | Path to PHP file to check |
| `code` | string | ❌ | PHP code string to check |

**Example Usage**:
```
# Check a file
banildtools_php_lint({ file_path: "wp-content/plugins/myplugin/plugin.php" })

# Check code string
banildtools_php_lint({ code: "<?php echo 'Hello'; ?>" })
```

**Returns**: `{ valid, errors, file_path }`

**Tips**:
- Use after creating/editing PHP files
- Returns specific line numbers for errors
- Provide either `file_path` OR `code`, not both

---

### 21. `banildtools_clear_cache`
**Purpose**: Clear WordPress caches.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | ❌ | Cache type: `"all"`, `"object"`, `"transients"`, `"rewrite"`, `"page"` |

**Example Usage**:
```
# Clear all caches
banildtools_clear_cache({ type: "all" })

# Clear just object cache
banildtools_clear_cache({ type: "object" })

# Flush rewrite rules
banildtools_clear_cache({ type: "rewrite" })
```

**Returns**: `{ type, cleared, details }`

---

### 22. `banildtools_server_info`
**Purpose**: Get comprehensive server information.

**Parameters**: None

**Example Usage**:
```
banildtools_server_info({})
```

**Returns**: Detailed object with PHP version, WordPress version, database info, disk space, memory limits, etc.

**Tips**:
- Use to diagnose server issues
- Shows memory limits, max upload size, PHP extensions
- Includes WordPress and database versions

---

### 23. `banildtools_db_query`
**Purpose**: Execute read-only SELECT SQL query.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | SELECT SQL query |
| `limit` | number | ❌ | Max rows to return (default: 100) |

**Example Usage**:
```
# Count published posts
banildtools_db_query({ query: "SELECT COUNT(*) as count FROM wp_posts WHERE post_status = 'publish'" })

# Get recent posts
banildtools_db_query({
  query: "SELECT ID, post_title, post_date FROM wp_posts WHERE post_type = 'post' ORDER BY post_date DESC",
  limit: 10
})

# Get users with specific role
banildtools_db_query({ query: "SELECT u.ID, u.user_email FROM wp_users u INNER JOIN wp_usermeta m ON u.ID = m.user_id WHERE m.meta_key = 'wp_capabilities' AND m.meta_value LIKE '%administrator%'" })
```

**Returns**: `{ query, rows, row_count, columns }`

**Tips**:
- **READ-ONLY**: Only SELECT queries allowed
- Use `wp_` prefix (or actual table prefix) for WordPress tables
- Requires database permission enabled in BanildTools settings
- Results automatically limited for safety

---

## 🎯 BEST PRACTICES

1. **Always read before editing**: Use `banildtools_read_file` to understand file contents before modifying
2. **Use grep to find files**: Don't guess file locations - use `banildtools_grep` or `banildtools_glob_search`
3. **Make surgical edits**: Use `banildtools_edit_file` with unique search strings instead of rewriting entire files
4. **Check PHP syntax**: After editing PHP files, use `banildtools_php_lint` to verify
5. **Backup before delete**: Use `banildtools_copy` to backup before using `banildtools_delete_file`
6. **Use appropriate paths**: Paths are relative to WordPress root - use `wp-content/...` not full server paths
7. **Handle large files**: Use `offset`/`limit` for reading and `banildtools_append_file` for writing large files

---

## 🚫 COMMON MISTAKES

❌ **Don't** rewrite entire files when you only need to change a few lines
✅ **Do** use `banildtools_edit_file` with unique context

❌ **Don't** guess file paths
✅ **Do** use `banildtools_list_dir` or `banildtools_glob_search` to find files

❌ **Don't** write PHP without checking syntax
✅ **Do** use `banildtools_php_lint` after PHP edits

❌ **Don't** use absolute server paths
✅ **Do** use paths relative to WordPress root (e.g., `wp-content/plugins/...`)

❌ **Don't** modify core WordPress files
✅ **Do** create child themes or custom plugins

---

*Generated for BanildMCP v2.2.0 + BanildTools v2.1.0*

