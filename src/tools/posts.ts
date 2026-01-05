/**
 * WordPress Posts Tools
 */
import { Responses } from "quickmcp-sdk";
import { callWordPressAPI } from "../utils/api.js";
import { formatPost, buildQueryString } from "../utils/helpers.js";

export function registerPostTools(server: any) {
  server.tool(
    "wordpress_create_post",
    async (args: any) => {
      const { title, content = "", status = "draft", categories, tags } = args;
      try {
        const postData: any = { title, content, status };
        if (categories) postData.categories = categories;
        if (tags) postData.tags = tags;
        const post = await callWordPressAPI("/posts", "POST", postData);
        return Responses.success(
          formatPost(post),
          `✅ Created post: "${title}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to create post: ${error.message}`);
      }
    },
    {
      description:
        "Create a new WordPress post with full control over all post properties",
      schema: { 
        title: "string",           // Required: Post title
        content: "string?",        // Optional: Post content (HTML)
        status: "string?",         // Optional: 'draft', 'publish', 'pending', 'private' (default: 'draft')
        categories: "array?",      // Optional: Array of category IDs
        tags: "array?"             // Optional: Array of tag IDs
      },
    }
  );

  server.tool(
    "wordpress_update_post",
    async (args: any) => {
      const { postId, updates } = args;
      try {
        const post = await callWordPressAPI(`/posts/${postId}`, "PUT", updates);
        return Responses.success(
          formatPost(post),
          `✅ Updated post ID ${postId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to update post: ${error.message}`);
      }
    },
    {
      description: "Update an existing post - can modify any post property",
      schema: { 
        postId: "number",      // Required: Post ID to update
        updates: "object"      // Required: Object with properties to update (title, content, status, etc)
      },
    }
  );

  server.tool(
    "wordpress_delete_post",
    async (args: any) => {
      const { postId, force = false } = args;
      try {
        const endpoint = force
          ? `/posts/${postId}?force=true`
          : `/posts/${postId}`;
        await callWordPressAPI(endpoint, "DELETE");
        return Responses.success(
          { id: postId, deleted: true },
          `✅ Deleted post ID ${postId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete post: ${error.message}`);
      }
    },
    {
      description:
        "Delete a post. Set force=true to permanently delete, otherwise moves to trash",
      schema: { 
        postId: "number",      // Required: Post ID to delete
        force: "boolean?"      // Optional: Permanently delete (default: false)
      },
    }
  );

  server.tool(
    "wordpress_get_posts",
    async (args: any) => {
      const {
        perPage = 10,
        page = 1,
        status = "publish",
        orderby = "date",
        order = "desc",
      } = args;
      try {
        const params = { per_page: perPage, page, status, orderby, order: order.toLowerCase() };
        const queryString = buildQueryString(params);
        const posts = await callWordPressAPI(`/posts?${queryString}`);
        return Responses.success(
          { posts: posts.map(formatPost), count: posts.length },
          `📝 Retrieved ${posts.length} posts`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get posts: ${error.message}`);
      }
    },
    {
      description:
        "Get posts with advanced filtering: search, author, categories, tags, status, ordering",
      schema: {
        perPage: "number?",    // Optional: Results per page (default: 10)
        page: "number?",       // Optional: Page number (default: 1)
        status: "string?",     // Optional: 'publish', 'draft', 'pending' (default: 'publish')
        orderby: "string?",    // Optional: 'date', 'title', 'modified' (default: 'date')
        order: "string?"       // Optional: 'desc' or 'asc' (default: 'desc') - ensure lowercase
      },
    }
  );

  server.tool(
    "wordpress_get_post",
    async (args: any) => {
      const { postId } = args;
      try {
        const post = await callWordPressAPI(`/posts/${postId}`);
        return Responses.success(
          {
            ...formatPost(post),
            content: post.content?.rendered || "",
            excerpt: post.excerpt?.rendered || "",
          },
          `📄 Retrieved post: "${post.title?.rendered}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get post: ${error.message}`);
      }
    },
    {
      description: "Get detailed information about a specific post by ID",
      schema: { postId: "number" },
    }
  );

  server.tool(
    "wordpress_search_posts",
    async (args: any) => {
      const { query, perPage = 10 } = args;
      try {
        const posts = await callWordPressAPI(
          `/posts?search=${encodeURIComponent(query)}&per_page=${perPage}`
        );
        return Responses.success(
          { posts: posts.map(formatPost), count: posts.length, query },
          `🔍 Found ${posts.length} posts for "${query}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to search posts: ${error.message}`);
      }
    },
    {
      description:
        "Search posts by keyword - searches title, content, and excerpt",
      schema: { 
        query: "string",       // Required: Search keyword
        perPage: "number?"     // Optional: Results per page (default: 10)
      },
    }
  );

  server.tool(
    "wordpress_schedule_post",
    async (args: any) => {
      const { postId, datetime } = args;
      try {
        const post = await callWordPressAPI(`/posts/${postId}`, "PUT", {
          status: "future",
          date: datetime,
        });
        return Responses.success(
          formatPost(post),
          `📅 Scheduled post ${postId} for ${datetime}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to schedule post: ${error.message}`);
      }
    },
    {
      description:
        "Schedule a post for future publication. Date format: YYYY-MM-DDTHH:MM:SS",
      schema: { postId: "number", datetime: "string" },
    }
  );

  server.tool(
    "wordpress_publish_post",
    async (args: any) => {
      const { postId } = args;
      try {
        const post = await callWordPressAPI(`/posts/${postId}`, "PUT", {
          status: "publish",
        });
        return Responses.success(
          formatPost(post),
          `✅ Published post ${postId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to publish post: ${error.message}`);
      }
    },
    {
      description: "Publish a draft or pending post immediately",
      schema: { postId: "number" },
    }
  );

  server.tool(
    "wordpress_duplicate_post",
    async (args: any) => {
      const { postId, newTitle } = args;
      try {
        const original = await callWordPressAPI(`/posts/${postId}`);
        const duplicate = await callWordPressAPI("/posts", "POST", {
          title: newTitle || `${original.title?.rendered} (Copy)`,
          content: original.content?.rendered || "",
          status: "draft",
          categories: original.categories,
          tags: original.tags,
        });
        return Responses.success(
          formatPost(duplicate),
          `✅ Duplicated post as "${duplicate.title?.rendered}"`
        );
      } catch (error: any) {
        return Responses.error(`Failed to duplicate post: ${error.message}`);
      }
    },
    {
      description: "Duplicate an existing post with optional new title",
      schema: { 
        postId: "number",      // Required: Post ID to duplicate
        newTitle: "string?"    // Optional: New title (default: 'Original Title (Copy)')
      },
    }
  );

  server.tool(
    "wordpress_get_post_revisions",
    async (args: any) => {
      const { postId } = args;
      try {
        const revisions = await callWordPressAPI(`/posts/${postId}/revisions`);
        return Responses.success(
          {
            revisions: revisions.map((r: any) => ({
              id: r.id,
              author: r.author,
              date: r.date,
              modified: r.modified,
            })),
            count: revisions.length,
          },
          `📜 Found ${revisions.length} revisions for post ${postId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get revisions: ${error.message}`);
      }
    },
    {
      description: "Get all revisions/edit history for a post",
      schema: { postId: "number" },
    }
  );

  server.tool(
    "wordpress_bulk_create_posts",
    async (args: any) => {
      const { posts } = args;
      try {
        const results = [];
        for (const postData of posts) {
          const post = await callWordPressAPI("/posts", "POST", postData);
          results.push(formatPost(post));
        }
        return Responses.success(
          { posts: results, count: results.length },
          `✅ Created ${results.length} posts`
        );
      } catch (error: any) {
        return Responses.error(`Failed to bulk create posts: ${error.message}`);
      }
    },
    {
      description:
        "Create multiple posts in one operation - efficient for batch content generation",
      schema: { posts: "array" },
    }
  );

  server.tool(
    "wordpress_bulk_update_posts",
    async (args: any) => {
      const { updates } = args;
      try {
        const results = [];
        for (const update of updates) {
          const { postId, ...data } = update;
          const post = await callWordPressAPI(`/posts/${postId}`, "PUT", data);
          results.push(formatPost(post));
        }
        return Responses.success(
          { posts: results, count: results.length },
          `✅ Updated ${results.length} posts`
        );
      } catch (error: any) {
        return Responses.error(`Failed to bulk update posts: ${error.message}`);
      }
    },
    {
      description:
        "Update multiple posts in one operation - efficient for batch modifications",
      schema: { updates: "array" },
    }
  );

  server.tool(
    "wordpress_bulk_delete_posts",
    async (args: any) => {
      const { postIds, force = false } = args;
      try {
        const results = [];
        for (const postId of postIds) {
          const endpoint = force
            ? `/posts/${postId}?force=true`
            : `/posts/${postId}`;
          await callWordPressAPI(endpoint, "DELETE");
          results.push({ id: postId, deleted: true });
        }
        return Responses.success(
          { deleted: results, count: results.length },
          `🗑️ Deleted ${results.length} posts`
        );
      } catch (error: any) {
        return Responses.error(`Failed to bulk delete posts: ${error.message}`);
      }
    },
    {
      description: "Delete multiple posts in one operation",
      schema: { 
        postIds: "array",      // Required: Array of post IDs to delete
        force: "boolean?"      // Optional: Permanently delete (default: false)
      },
    }
  );
}
