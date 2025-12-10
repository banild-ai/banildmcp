/**
 * WordPress Configuration
 * Handles environment variables and credentials
 */
export interface WordPressConfig {
    url: string;
    username: string;
    password: string;
    wcKey?: string;
    wcSecret?: string;
    getAuthToken: () => string;
    validate: () => void;
}
export declare const config: WordPressConfig;
//# sourceMappingURL=wordpress.d.ts.map