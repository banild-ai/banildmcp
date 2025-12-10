/**
 * WordPress Type Definitions
 */
export interface WPPost {
    id: number;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    status: string;
    slug: string;
    date: string;
    modified: string;
    link: string;
    author: number;
    categories: number[];
    tags: number[];
    featured_media: number;
}
export interface WPPage {
    id: number;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    status: string;
    slug: string;
    link: string;
    parent: number;
    menu_order: number;
}
export interface WPUser {
    id: number;
    username: string;
    name: string;
    email: string;
    roles: string[];
    slug: string;
    link: string;
}
export interface WPMedia {
    id: number;
    title: {
        rendered: string;
    };
    source_url: string;
    media_type: string;
    mime_type: string;
    alt_text: string;
    caption: {
        rendered: string;
    };
}
export interface WPCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
    parent: number;
    description: string;
}
export interface WPTag {
    id: number;
    name: string;
    slug: string;
    count: number;
}
export interface WPComment {
    id: number;
    post: number;
    author_name: string;
    content: {
        rendered: string;
    };
    date: string;
    status: string;
}
export interface FileInfo {
    path: string;
    name: string;
    type: "file" | "directory";
    size?: number;
    modified: string;
    permissions: string;
    extension?: string;
    mime_type?: string;
    lines?: number;
    items_count?: number;
}
export interface DirectoryItem {
    name: string;
    type: "file" | "directory";
    size?: number;
    modified: string;
    permissions: string;
    extension?: string;
}
export interface SearchMatch {
    line_number: number;
    content: string;
    context_before?: Array<{
        line_number: number;
        content: string;
    }>;
    context_after?: Array<{
        line_number: number;
        content: string;
    }>;
}
export interface SearchResult {
    file: string;
    matches: SearchMatch[];
    count?: number;
}
export interface GlobResult {
    path: string;
    name: string;
    size: number;
    modified: string;
}
//# sourceMappingURL=wordpress.d.ts.map