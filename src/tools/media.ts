/**
 * WordPress Media Tools
 */
import { Responses } from "quickmcp-sdk";
import { callWordPressAPI, uploadMediaFile, uploadMediaFromUrl } from "../utils/api.js";
import { formatMedia, buildQueryString } from "../utils/helpers.js";

export function registerMediaTools(server: any) {
  server.tool(
    "wordpress_upload_media",
    async (args: any) => {
      const { fileBase64, filename, fileUrl } = args;
      try {
        let media;
        if (fileUrl) {
          media = await uploadMediaFromUrl(fileUrl, filename);
        } else if (fileBase64 && filename) {
          media = await uploadMediaFile(fileBase64, filename);
        } else {
          return Responses.error("Provide either fileUrl or fileBase64 with filename");
        }
        return Responses.success(formatMedia(media), `✅ Uploaded: ${media.source_url}`);
      } catch (error: any) {
        return Responses.error(`Failed to upload media: ${error.message}`);
      }
    },
    {
      description: "Upload image or file to WordPress media library (provide base64 encoded file or URL)",
      schema: { fileBase64: "string", filename: "string" },
    }
  );

  server.tool(
    "wordpress_get_media",
    async (args: any) => {
      const { perPage = 10, page = 1, mediaType } = args;
      try {
        const params: any = { per_page: perPage, page };
        if (mediaType) params.media_type = mediaType;
        const queryString = buildQueryString(params);
        const media = await callWordPressAPI(`/media?${queryString}`);
        return Responses.success(
          { media: media.map(formatMedia), count: media.length },
          `🖼️ Retrieved ${media.length} media items`
        );
      } catch (error: any) {
        return Responses.error(`Failed to get media: ${error.message}`);
      }
    },
    {
      description: "Get media library files with filtering by type",
      schema: { perPage: "number", page: "number" },
    }
  );

  server.tool(
    "wordpress_update_media",
    async (args: any) => {
      const { mediaId, altText, caption, title, description } = args;
      try {
        const updates: any = {};
        if (altText) updates.alt_text = altText;
        if (caption) updates.caption = caption;
        if (title) updates.title = title;
        if (description) updates.description = description;
        const media = await callWordPressAPI(`/media/${mediaId}`, "PUT", updates);
        return Responses.success(formatMedia(media), `✅ Updated media ID ${mediaId}`);
      } catch (error: any) {
        return Responses.error(`Failed to update media: ${error.message}`);
      }
    },
    {
      description: "Update media file metadata (alt text, caption, title)",
      schema: { mediaId: "number" },
    }
  );

  server.tool(
    "wordpress_delete_media",
    async (args: any) => {
      const { mediaId, force = true } = args;
      try {
        await callWordPressAPI(`/media/${mediaId}?force=${force}`, "DELETE");
        return Responses.success(
          { id: mediaId, deleted: true },
          `✅ Deleted media ID ${mediaId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to delete media: ${error.message}`);
      }
    },
    {
      description: "Delete a media file from library",
      schema: { mediaId: "number", force: "boolean" },
    }
  );

  server.tool(
    "wordpress_set_featured_image",
    async (args: any) => {
      const { postId, mediaId } = args;
      try {
        const post = await callWordPressAPI(`/posts/${postId}`, "PUT", {
          featured_media: mediaId,
        });
        return Responses.success(
          { postId, mediaId, set: true },
          `✅ Set featured image for post ${postId}`
        );
      } catch (error: any) {
        return Responses.error(`Failed to set featured image: ${error.message}`);
      }
    },
    {
      description: "Set featured image (thumbnail) for a post",
      schema: { postId: "number", mediaId: "number" },
    }
  );
}

