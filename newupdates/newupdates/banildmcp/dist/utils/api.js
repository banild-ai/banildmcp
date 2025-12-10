/**
 * WordPress REST API Wrapper
 * Handles all API calls to WordPress and BanildTools
 */
import fetch from "node-fetch";
import { config } from "../config/wordpress.js";
/**
 * Check if BanildTools plugin is installed and active on the WordPress site
 * Uses the public /tools endpoint for discovery (no auth required)
 * Returns status info if available, null if not installed/accessible
 */
export async function checkBanildToolsAvailability() {
    // Try the public /tools endpoint first (no auth required for discovery)
    const toolsUrl = `${config.url}/wp-json/banildtools/v1/tools`;
    try {
        const response = await fetch(toolsUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            const data = await response.json();
            return {
                available: true,
                version: data.version,
                toolsCount: data.tools_count,
                message: `BanildTools v${data.version} detected (${data.tools_count} additional tools)`,
            };
        }
        // 404 means plugin not installed/active or endpoint not registered
        if (response.status === 404) {
            return {
                available: false,
                message: "BanildTools plugin not installed or inactive",
            };
        }
        // Other errors
        return {
            available: false,
            message: `BanildTools check failed: ${response.status} ${response.statusText}`,
        };
    }
    catch (error) {
        return {
            available: false,
            message: `BanildTools check failed: ${error.message}`,
        };
    }
}
/**
 * Call WordPress REST API
 */
export async function callWordPressAPI(endpoint, method = "GET", body) {
    const url = `${config.url}/wp-json/wp/v2${endpoint}`;
    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Basic ${config.getAuthToken()}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WordPress API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    }
    catch (error) {
        throw new Error(`Failed to call WordPress API: ${error.message}`);
    }
}
/**
 * Call WordPress root API (for site info)
 */
export async function callWordPressRootAPI() {
    const url = `${config.url}/wp-json/`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Basic ${config.getAuthToken()}` },
        });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        throw new Error(`Failed to call WordPress root API: ${error.message}`);
    }
}
/**
 * Call BanildTools REST API
 * Calls the banildtools plugin endpoints for file operations
 */
export async function callBanildToolsAPI(endpoint, method = "POST", body) {
    const url = `${config.url}/wp-json/banildtools/v1${endpoint}`;
    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Basic ${config.getAuthToken()}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`BanildTools API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    }
    catch (error) {
        throw new Error(`Failed to call BanildTools API: ${error.message}`);
    }
}
/**
 * Search WordPress.org plugin directory
 */
export async function searchWordPressOrgPlugins(query, page = 1, perPage = 10) {
    const base = "https://wordpress.org/plugins/wp-json/wp/v2";
    const tryUrls = [
        `${base}/plugin?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        `${base}/search?search=${encodeURIComponent(query)}&subtype=plugin&page=${page}&per_page=${perPage}`,
    ];
    let lastError = null;
    for (const url of tryUrls) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                lastError = new Error(`WordPress.org API error: ${res.status} ${res.statusText}`);
                continue;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                return data.map((item) => {
                    const slug = item.slug ||
                        (typeof item.url === "string"
                            ? (item.url.split("/plugins/")[1] || "").replace(/\/?$/, "")
                            : "");
                    const name = item.name?.rendered || item.title?.rendered || item.title || slug;
                    const description = item.short_description?.rendered ||
                        item.excerpt?.rendered ||
                        item.description ||
                        "";
                    return { slug, name, description };
                });
            }
            return [];
        }
        catch (err) {
            lastError = err;
            continue;
        }
    }
    throw lastError || new Error("Failed to search WordPress.org plugins");
}
/**
 * Call WooCommerce REST API (v3)
 */
export async function callWooCommerceAPI(endpoint, method = "GET", body) {
    const base = `${config.url}/wp-json/wc/v3${endpoint}`;
    const url = config.wcKey && config.wcSecret
        ? `${base}${base.includes("?") ? "&" : "?"}consumer_key=${encodeURIComponent(config.wcKey)}&consumer_secret=${encodeURIComponent(config.wcSecret)}`
        : base;
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        if (!config.wcKey || !config.wcSecret) {
            headers.Authorization = `Basic ${config.getAuthToken()}`;
        }
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    }
    catch (error) {
        throw new Error(`Failed to call WooCommerce API: ${error.message}`);
    }
}
/**
 * Upload media file to WordPress
 */
export async function uploadMediaFile(fileBase64, filename) {
    const buffer = Buffer.from(fileBase64, "base64");
    const ext = filename.toLowerCase().split(".").pop() || "";
    const mimeTypes = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    const contentTypeHeader = `Content-Type: ${contentType}`;
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36);
    const boundary_buffer = Buffer.from("--" + boundary + "\r\n");
    const header1 = Buffer.from('Content-Disposition: form-data; name="file"; filename="' + filename + '"\r\n');
    const header2 = Buffer.from(contentTypeHeader + "\r\n\r\n");
    const footer = Buffer.from("\r\n--" + boundary + "--\r\n");
    const body = Buffer.concat([boundary_buffer, header1, header2, buffer, footer]);
    const url = `${config.url}/wp-json/wp/v2/media`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${config.getAuthToken()}`,
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
            },
            body,
        });
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        throw new Error(`Failed to upload media: ${error.message}`);
    }
}
/**
 * Upload media to WordPress from a remote URL
 */
export async function uploadMediaFromUrl(fileUrl, filename) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch media from URL: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentTypeHeader = `Content-Type: ${contentType}`;
    let resolvedFilename = filename;
    if (!resolvedFilename) {
        try {
            const urlObj = new URL(fileUrl);
            const pathname = urlObj.pathname || "";
            const last = pathname.split("/").filter(Boolean).pop();
            resolvedFilename = last || "upload";
        }
        catch {
            resolvedFilename = "upload";
        }
    }
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36);
    const boundary_buffer = Buffer.from("--" + boundary + "\r\n");
    const header1 = Buffer.from('Content-Disposition: form-data; name="file"; filename="' +
        resolvedFilename +
        '"\r\n');
    const header2 = Buffer.from(contentTypeHeader + "\r\n\r\n");
    const footer = Buffer.from("\r\n--" + boundary + "--\r\n");
    const body = Buffer.concat([boundary_buffer, header1, header2, buffer, footer]);
    const url = `${config.url}/wp-json/wp/v2/media`;
    try {
        const wpResponse = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${config.getAuthToken()}`,
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
            },
            body,
        });
        if (!wpResponse.ok) {
            const errorText = await wpResponse.text();
            throw new Error(`Upload failed: ${wpResponse.status} ${wpResponse.statusText} - ${errorText}`);
        }
        return await wpResponse.json();
    }
    catch (error) {
        throw new Error(`Failed to upload media: ${error.message}`);
    }
}
//# sourceMappingURL=api.js.map