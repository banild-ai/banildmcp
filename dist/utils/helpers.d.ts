/**
 * Helper Functions
 */
import { WPPost, WPUser, WPComment, WPMedia, WPPage } from "../types/wordpress.js";
/**
 * Format post for display
 */
export declare function formatPost(post: WPPost): {
    id: number;
    title: string;
    status: string;
    slug: string;
    date: string;
    modified: string;
    link: string;
    excerpt: string;
};
/**
 * Format page for display
 */
export declare function formatPage(page: WPPage): {
    id: number;
    title: string;
    status: string;
    slug: string;
    link: string;
    parent: number;
    menu_order: number;
};
/**
 * Format user for display
 */
export declare function formatUser(user: WPUser): {
    id: number;
    username: string;
    name: string;
    email: string;
    roles: string[];
    link: string;
};
/**
 * Format comment for display
 */
export declare function formatComment(comment: WPComment): {
    id: number;
    post: number;
    author: string;
    content: string;
    date: string;
    status: string;
};
/**
 * Format media for display
 */
export declare function formatMedia(media: WPMedia): {
    id: number;
    title: string;
    url: string;
    type: string;
    mimeType: string;
    alt: string;
};
/**
 * Build query string from object
 */
export declare function buildQueryString(params: Record<string, any>): string;
/**
 * Truncate string
 */
export declare function truncate(str: string, length: number): string;
//# sourceMappingURL=helpers.d.ts.map