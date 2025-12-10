/**
 * BanildTools File Operations
 * Cursor-like file operation tools via WordPress REST API
 * Requires BanildTools WordPress plugin to be installed and active
 */
import { Responses } from "quickmcp-sdk";
import { callBanildToolsAPI } from "../utils/api.js";

export function registerFileOperationTools(server: any) {
  // ========== READ FILE ==========
  server.tool(
    "banildtools_read_file",
    async (args: any) => {
      const { target_file, offset, limit } = args;
      try {
        const result = await callBanildToolsAPI("/read", "POST", {
          target_file,
          offset,
          limit,
        });
        return Responses.success(
          {
            path: result.path,
            contents: result.contents,
            size: result.size,
            total_lines: result.total_lines,
            mime_type: result.mime_type,
            is_binary: result.is_binary,
            is_image: result.is_image,
            contents_base64: result.contents_base64,
          },
          `📄 Read file: ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to read file: ${error.message}`);
      }
    },
    {
      description:
        "Read file contents from WordPress server. Supports line offset and limit for partial reads. Returns base64 for images.",
      schema: {
        target_file: "string",
        offset: "number?",
        limit: "number?",
      },
    }
  );

  // ========== WRITE FILE ==========
  server.tool(
    "banildtools_write_file",
    async (args: any) => {
      const { file_path, contents } = args;
      try {
        const result = await callBanildToolsAPI("/write", "POST", {
          file_path,
          contents,
        });
        return Responses.success(
          {
            path: result.path,
            bytes_written: result.bytes_written,
          },
          `✅ Written ${result.bytes_written} bytes to ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to write file: ${error.message}`);
      }
    },
    {
      description:
        "Create or overwrite a file on WordPress server. Creates parent directories if needed.",
      schema: {
        file_path: "string",
        contents: "string",
      },
    }
  );

  // ========== EDIT FILE (SEARCH & REPLACE) ==========
  server.tool(
    "banildtools_edit_file",
    async (args: any) => {
      const { file_path, old_string, new_string, replace_all = false } = args;
      try {
        const result = await callBanildToolsAPI("/edit", "POST", {
          file_path,
          old_string,
          new_string,
          replace_all,
        });
        return Responses.success(
          {
            path: result.path,
            replacements: result.replacements,
            bytes_written: result.bytes_written,
          },
          `✅ Replaced ${result.replacements} occurrence(s) in ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to edit file: ${error.message}`);
      }
    },
    {
      description:
        "Search and replace text in a file. Set replace_all=true to replace all occurrences, otherwise replaces only the first unique match.",
      schema: {
        file_path: "string",
        old_string: "string",
        new_string: "string",
        replace_all: "boolean?",
      },
    }
  );

  // ========== DELETE FILE ==========
  server.tool(
    "banildtools_delete_file",
    async (args: any) => {
      const { target_file } = args;
      try {
        const result = await callBanildToolsAPI("/delete", "POST", {
          target_file,
        });
        return Responses.success(
          {
            path: result.path,
            deleted: true,
          },
          `🗑️ Deleted: ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete file: ${error.message}`);
      }
    },
    {
      description:
        "Delete a file or directory from WordPress server. Directories are deleted recursively. Requires delete permission enabled in plugin settings.",
      schema: {
        target_file: "string",
      },
    }
  );

  // ========== LIST DIRECTORY ==========
  server.tool(
    "banildtools_list_dir",
    async (args: any) => {
      const { target_directory, ignore_globs = [] } = args;
      try {
        const result = await callBanildToolsAPI("/list", "POST", {
          target_directory,
          ignore_globs,
        });
        return Responses.success(
          {
            path: result.path,
            total_items: result.total_items,
            items: result.items,
          },
          `📁 Listed ${result.total_items} items in ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to list directory: ${error.message}`);
      }
    },
    {
      description:
        "List directory contents on WordPress server. Returns files and directories with metadata. Supports ignore patterns.",
      schema: {
        target_directory: "string",
        ignore_globs: "array?",
      },
    }
  );

  // ========== SEARCH FILES (GREP) ==========
  server.tool(
    "banildtools_grep",
    async (args: any) => {
      const {
        pattern,
        path,
        glob,
        case_insensitive = false,
        context_lines = 0,
        output_mode = "content",
        max_results = 500,
      } = args;
      try {
        const result = await callBanildToolsAPI("/search", "POST", {
          pattern,
          path,
          glob,
          case_insensitive,
          context_lines,
          output_mode,
          max_results,
        });
        return Responses.success(
          {
            pattern: result.pattern,
            path: result.path,
            output_mode: result.output_mode,
            files_searched: result.files_searched,
            files_with_matches: result.files_with_matches,
            total_matches: result.total_matches,
            truncated: result.truncated,
            results: result.results,
          },
          `🔍 Found ${result.total_matches} matches in ${result.files_with_matches} files`
        );
      } catch (error: any) {
        return Responses.error(`Failed to search files: ${error.message}`);
      }
    },
    {
      description:
        "Search for regex patterns in files (grep-like). Supports file glob filtering, context lines, and multiple output modes (content, files_with_matches, count).",
      schema: {
        pattern: "string",
        path: "string?",
        glob: "string?",
        case_insensitive: "boolean?",
        context_lines: "number?",
        output_mode: "string?",
        max_results: "number?",
      },
    }
  );

  // ========== GLOB FILE SEARCH ==========
  server.tool(
    "banildtools_glob_search",
    async (args: any) => {
      const { glob_pattern, target_directory } = args;
      try {
        const result = await callBanildToolsAPI("/glob", "POST", {
          glob_pattern,
          target_directory,
        });
        return Responses.success(
          {
            pattern: result.pattern,
            directory: result.directory,
            total_files: result.total_files,
            files: result.files,
          },
          `📂 Found ${result.total_files} files matching ${result.pattern}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to glob search: ${error.message}`);
      }
    },
    {
      description:
        "Find files matching a glob pattern on WordPress server. Results sorted by modification time (newest first).",
      schema: {
        glob_pattern: "string",
        target_directory: "string?",
      },
    }
  );

  // ========== CREATE DIRECTORY ==========
  server.tool(
    "banildtools_mkdir",
    async (args: any) => {
      const { path, recursive = true } = args;
      try {
        const result = await callBanildToolsAPI("/mkdir", "POST", {
          path,
          recursive,
        });
        return Responses.success(
          {
            path: result.path,
          },
          `📁 Created directory: ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to create directory: ${error.message}`);
      }
    },
    {
      description:
        "Create a directory on WordPress server. Creates parent directories by default (recursive=true).",
      schema: {
        path: "string",
        recursive: "boolean?",
      },
    }
  );

  // ========== RENAME/MOVE ==========
  server.tool(
    "banildtools_rename",
    async (args: any) => {
      const { source, destination } = args;
      try {
        const result = await callBanildToolsAPI("/rename", "POST", {
          source,
          destination,
        });
        return Responses.success(
          {
            source: result.source,
            destination: result.destination,
          },
          `📝 Renamed ${result.source} → ${result.destination}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to rename: ${error.message}`);
      }
    },
    {
      description:
        "Rename or move a file/directory on WordPress server. Creates destination directory if needed.",
      schema: {
        source: "string",
        destination: "string",
      },
    }
  );

  // ========== COPY ==========
  server.tool(
    "banildtools_copy",
    async (args: any) => {
      const { source, destination } = args;
      try {
        const result = await callBanildToolsAPI("/copy", "POST", {
          source,
          destination,
        });
        return Responses.success(
          {
            source: result.source,
            destination: result.destination,
          },
          `📋 Copied ${result.source} → ${result.destination}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to copy: ${error.message}`);
      }
    },
    {
      description:
        "Copy a file or directory on WordPress server. Directories are copied recursively.",
      schema: {
        source: "string",
        destination: "string",
      },
    }
  );

  // ========== FILE INFO ==========
  server.tool(
    "banildtools_file_info",
    async (args: any) => {
      const { path } = args;
      try {
        const result = await callBanildToolsAPI("/info", "POST", { path });
        return Responses.success(
          result.info,
          `ℹ️ Info for: ${result.info.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get file info: ${error.message}`);
      }
    },
    {
      description:
        "Get detailed information about a file or directory on WordPress server (size, permissions, modified date, line count, etc).",
      schema: {
        path: "string",
      },
    }
  );

  // ========== APPEND FILE ==========
  server.tool(
    "banildtools_append_file",
    async (args: any) => {
      const { file_path, contents } = args;
      try {
        const result = await callBanildToolsAPI("/append", "POST", {
          file_path,
          contents,
        });
        return Responses.success(
          {
            path: result.path,
            bytes_appended: result.bytes_appended,
          },
          `✅ Appended ${result.bytes_appended} bytes to ${result.path}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to append to file: ${error.message}`);
      }
    },
    {
      description:
        "Append content to end of file. Use for writing large files in chunks to avoid timeouts.",
      schema: {
        file_path: "string",
        contents: "string",
      },
    }
  );

  // ========== GET OPTION ==========
  server.tool(
    "banildtools_get_option",
    async (args: any) => {
      const { name } = args;
      try {
        const result = await callBanildToolsAPI("/option/get", "POST", { name });
        return Responses.success(
          {
            name: result.name,
            value: result.value,
            exists: result.exists,
          },
          `⚙️ Option "${name}": ${result.exists ? JSON.stringify(result.value).substring(0, 100) : "(not set)"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get option: ${error.message}`);
      }
    },
    {
      description: "Get WordPress option value by name.",
      schema: {
        name: "string",
      },
    }
  );

  // ========== SET OPTION ==========
  server.tool(
    "banildtools_set_option",
    async (args: any) => {
      const { name, value } = args;
      try {
        const result = await callBanildToolsAPI("/option/set", "POST", { name, value });
        return Responses.success(
          {
            name: result.name,
            updated: result.updated,
          },
          `✅ Option "${name}" ${result.updated ? "updated" : "set"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to set option: ${error.message}`);
      }
    },
    {
      description: "Set WordPress option value.",
      schema: {
        name: "string",
        value: "any?",
      },
    }
  );

  // ========== DELETE OPTION ==========
  server.tool(
    "banildtools_delete_option",
    async (args: any) => {
      const { name } = args;
      try {
        const result = await callBanildToolsAPI("/option/delete", "POST", { name });
        return Responses.success(
          {
            name: result.name,
            deleted: result.deleted,
          },
          `${result.deleted ? "✅" : "⚠️"} Option "${name}" ${result.deleted ? "deleted" : "was not found"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete option: ${error.message}`);
      }
    },
    {
      description: "Delete WordPress option.",
      schema: {
        name: "string",
      },
    }
  );

  // ========== GET TRANSIENT ==========
  server.tool(
    "banildtools_get_transient",
    async (args: any) => {
      const { name } = args;
      try {
        const result = await callBanildToolsAPI("/transient/get", "POST", { name });
        return Responses.success(
          {
            name: result.name,
            value: result.value,
            exists: result.exists,
          },
          `⏱️ Transient "${name}": ${result.exists ? JSON.stringify(result.value).substring(0, 100) : "(not set)"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get transient: ${error.message}`);
      }
    },
    {
      description: "Get WordPress transient value.",
      schema: {
        name: "string",
      },
    }
  );

  // ========== SET TRANSIENT ==========
  server.tool(
    "banildtools_set_transient",
    async (args: any) => {
      const { name, value, expiration = 0 } = args;
      try {
        const result = await callBanildToolsAPI("/transient/set", "POST", {
          name,
          value,
          expiration,
        });
        return Responses.success(
          {
            name: result.name,
            set: result.set,
            expiration: result.expiration,
          },
          `✅ Transient "${name}" set${expiration ? ` (expires in ${expiration}s)` : ""}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to set transient: ${error.message}`);
      }
    },
    {
      description: "Set WordPress transient with expiration time in seconds.",
      schema: {
        name: "string",
        value: "any?",
        expiration: "number?",
      },
    }
  );

  // ========== DELETE TRANSIENT ==========
  server.tool(
    "banildtools_delete_transient",
    async (args: any) => {
      const { name } = args;
      try {
        const result = await callBanildToolsAPI("/transient/delete", "POST", { name });
        return Responses.success(
          {
            name: result.name,
            deleted: result.deleted,
          },
          `${result.deleted ? "✅" : "⚠️"} Transient "${name}" ${result.deleted ? "deleted" : "was not found"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete transient: ${error.message}`);
      }
    },
    {
      description: "Delete WordPress transient.",
      schema: {
        name: "string",
      },
    }
  );

  // ========== DEBUG LOG ==========
  server.tool(
    "banildtools_debug_log",
    async (args: any) => {
      const { action = "tail", lines = 100 } = args || {};
      try {
        const result = await callBanildToolsAPI("/debug-log", "POST", { action, lines });
        if (action === "clear") {
          return Responses.success(
            { cleared: result.cleared },
            `🗑️ Debug log ${result.cleared ? "cleared" : "could not be cleared"}`
          );
        }
        return Responses.success(
          {
            path: result.path,
            exists: result.exists,
            size: result.size,
            content: result.content,
            lines_returned: result.lines_returned,
          },
          `📋 Debug log: ${result.exists ? `${result.lines_returned} lines` : "not found"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to access debug log: ${error.message}`);
      }
    },
    {
      description: "Read, tail, or clear WordPress debug.log file.",
      schema: {
        action: "string?",
        lines: "number?",
      },
    }
  );

  // ========== PHP LINT ==========
  server.tool(
    "banildtools_php_lint",
    async (args: any) => {
      const { file_path, code } = args || {};
      try {
        const payload: any = {};
        if (file_path) payload.file_path = file_path;
        if (code) payload.code = code;
        const result = await callBanildToolsAPI("/php-lint", "POST", payload);
        return Responses.success(
          {
            valid: result.valid,
            errors: result.errors,
            file_path: result.file_path,
          },
          `${result.valid ? "✅ PHP syntax valid" : `❌ PHP errors: ${result.errors?.length || 0}`}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to lint PHP: ${error.message}`);
      }
    },
    {
      description: "Check PHP syntax for errors. Provide either file_path or code string.",
      schema: {
        file_path: "string?",
        code: "string?",
      },
    }
  );

  // ========== CLEAR CACHE ==========
  server.tool(
    "banildtools_clear_cache",
    async (args: any) => {
      const { type = "all" } = args || {};
      try {
        const result = await callBanildToolsAPI("/clear-cache", "POST", { type });
        return Responses.success(
          {
            type: result.type,
            cleared: result.cleared,
            details: result.details,
          },
          `🧹 Cache cleared: ${result.type}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to clear cache: ${error.message}`);
      }
    },
    {
      description: "Clear WordPress caches (object, transients, rewrite rules, page cache).",
      schema: {
        type: "string?",
      },
    }
  );

  // ========== SERVER INFO ==========
  server.tool(
    "banildtools_server_info",
    async () => {
      try {
        const result = await callBanildToolsAPI("/server-info", "GET");
        return Responses.success(
          result,
          `🖥️ Server: PHP ${result.php?.version || "?"}, WP ${result.wordpress?.version || "?"}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get server info: ${error.message}`);
      }
    },
    {
      description:
        "Get comprehensive server information (PHP, WordPress, Database, Disk, etc).",
      schema: {},
    }
  );

  // ========== DATABASE QUERY ==========
  server.tool(
    "banildtools_db_query",
    async (args: any) => {
      const { query, limit = 100 } = args;
      try {
        const result = await callBanildToolsAPI("/db-query", "POST", { query, limit });
        return Responses.success(
          {
            query: result.query,
            rows: result.rows,
            row_count: result.row_count,
            columns: result.columns,
          },
          `🗄️ Query returned ${result.row_count} rows`
        );
      } catch (error: any) {
        return Responses.error(`Failed to execute query: ${error.message}`);
      }
    },
    {
      description: "Execute read-only SELECT SQL query on WordPress database.",
      schema: {
        query: "string",
        limit: "number?",
      },
    }
  );
}

