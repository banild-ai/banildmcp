/**
 * WordPress Pages Tools
 */
import { Responses } from "quickmcp-sdk";
import { callWordPressAPI } from "../utils/api.js";
import { formatPage, buildQueryString } from "../utils/helpers.js";

export function registerPageTools(server: any) {
  server.tool(
    "wordpress_create_page",
    async (args: any) => {
      const { title, content, status = "draft", parent = 0 } = args;
      try {
        const page = await callWordPressAPI("/pages", "POST", {
          title,
          content,
          status,
          parent,
        });
        return Responses.success(formatPage(page), `✅ Created page: "${title}"`);
      } catch (error: any) {
        return Responses.error(`Failed to create page: ${error.message}`);
      }
    },
    {
      description: "Create a new WordPress page with hierarchy support",
      schema: { title: "string", content: "string" },
    }
  );

  server.tool(
    "wordpress_update_page",
    async (args: any) => {
      const { pageId, updates } = args;
      try {
        const page = await callWordPressAPI(`/pages/${pageId}`, "PUT", updates);
        return Responses.success(formatPage(page), `✅ Updated page ID ${pageId}`);
      } catch (error: any) {
        return Responses.error(`Failed to update page: ${error.message}`);
      }
    },
    {
      description: "Update an existing page",
      schema: { pageId: "number", updates: "object" },
    }
  );

  server.tool(
    "wordpress_get_pages",
    async (args: any) => {
      const { perPage = 10, page = 1, parent, status = "publish" } = args;
      try {
        const params: any = { per_page: perPage, page, status };
        if (parent !== undefined) params.parent = parent;
        const queryString = buildQueryString(params);
        const pages = await callWordPressAPI(`/pages?${queryString}`);
        return Responses.success(
          { pages: pages.map(formatPage), count: pages.length },
          `📄 Retrieved ${pages.length} pages`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get pages: ${error.message}`);
      }
    },
    {
      description: "Get pages with hierarchy and ordering",
      schema: { perPage: "number", page: "number" },
    }
  );

  server.tool(
    "wordpress_delete_page",
    async (args: any) => {
      const { pageId, force = false } = args;
      try {
        const endpoint = force ? `/pages/${pageId}?force=true` : `/pages/${pageId}`;
        await callWordPressAPI(endpoint, "DELETE");
        return Responses.success(
          { id: pageId, deleted: true },
          `✅ Deleted page ID ${pageId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete page: ${error.message}`);
      }
    },
    {
      description: "Delete a page",
      schema: { pageId: "number", force: "boolean" },
    }
  );
}

