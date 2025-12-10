/**
 * Check if BanildTools plugin is installed and active on the WordPress site
 * Returns status info if available, null if not installed/accessible
 */
export declare function checkBanildToolsAvailability(): Promise<{
    available: boolean;
    version?: string;
    message: string;
}>;
/**
 * Call WordPress REST API
 */
export declare function callWordPressAPI(endpoint: string, method?: string, body?: object): Promise<any>;
/**
 * Call WordPress root API (for site info)
 */
export declare function callWordPressRootAPI(): Promise<any>;
/**
 * Call BanildTools REST API
 * Calls the banildtools plugin endpoints for file operations
 */
export declare function callBanildToolsAPI(endpoint: string, method?: string, body?: object): Promise<any>;
/**
 * Search WordPress.org plugin directory
 */
export declare function searchWordPressOrgPlugins(query: string, page?: number, perPage?: number): Promise<any[]>;
/**
 * Call WooCommerce REST API (v3)
 */
export declare function callWooCommerceAPI(endpoint: string, method?: string, body?: object): Promise<any>;
/**
 * Upload media file to WordPress
 */
export declare function uploadMediaFile(fileBase64: string, filename: string): Promise<any>;
/**
 * Upload media to WordPress from a remote URL
 */
export declare function uploadMediaFromUrl(fileUrl: string, filename?: string): Promise<any>;
//# sourceMappingURL=api.d.ts.map