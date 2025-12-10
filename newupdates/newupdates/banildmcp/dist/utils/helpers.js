/**
 * Format post for display
 */
export function formatPost(post) {
    return {
        id: post.id,
        title: post.title?.rendered || "",
        status: post.status,
        slug: post.slug,
        date: post.date,
        modified: post.modified,
        link: post.link,
        excerpt: post.excerpt?.rendered?.replace(/<[^>]*>/g, "").substring(0, 150) || "",
    };
}
/**
 * Format page for display
 */
export function formatPage(page) {
    return {
        id: page.id,
        title: page.title?.rendered || "",
        status: page.status,
        slug: page.slug,
        link: page.link,
        parent: page.parent,
        menu_order: page.menu_order,
    };
}
/**
 * Format user for display
 */
export function formatUser(user) {
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles,
        link: user.link,
    };
}
/**
 * Format comment for display
 */
export function formatComment(comment) {
    return {
        id: comment.id,
        post: comment.post,
        author: comment.author_name,
        content: comment.content?.rendered?.replace(/<[^>]*>/g, "") || "",
        date: comment.date,
        status: comment.status,
    };
}
/**
 * Format media for display
 */
export function formatMedia(media) {
    return {
        id: media.id,
        title: media.title?.rendered || "",
        url: media.source_url,
        type: media.media_type,
        mimeType: media.mime_type,
        alt: media.alt_text,
    };
}
/**
 * Build query string from object
 */
export function buildQueryString(params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    }
    return searchParams.toString();
}
/**
 * Truncate string
 */
export function truncate(str, length) {
    if (str.length <= length)
        return str;
    return str.substring(0, length) + "...";
}
//# sourceMappingURL=helpers.js.map