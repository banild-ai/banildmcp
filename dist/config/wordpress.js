/**
 * WordPress Configuration
 * Handles environment variables and credentials
 */
function getEnvVar(name, defaultValue) {
    return process.env[name] || defaultValue || "";
}
export const config = {
    url: getEnvVar("WORDPRESS_URL", "").replace(/\/$/, ""),
    username: getEnvVar("WORDPRESS_USERNAME"),
    password: getEnvVar("WORDPRESS_PASSWORD"),
    wcKey: getEnvVar("WC_CONSUMER_KEY"),
    wcSecret: getEnvVar("WC_CONSUMER_SECRET"),
    getAuthToken() {
        return Buffer.from(`${this.username}:${this.password}`).toString("base64");
    },
    validate() {
        if (!this.url) {
            console.error("❌ WORDPRESS_URL environment variable is required");
            process.exit(1);
        }
        if (!this.username || !this.password) {
            console.error("❌ WORDPRESS_USERNAME and WORDPRESS_PASSWORD environment variables are required");
            process.exit(1);
        }
        console.log("✅ Configuration validated");
    },
};
//# sourceMappingURL=wordpress.js.map