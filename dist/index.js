#!/usr/bin/env node
/**
 * Banild MCP Server - Main Entry Point
 * Comprehensive WordPress management through MCP
 *
 * Organization:
 * - config/: Configuration and environment
 * - types/: TypeScript type definitions
 * - utils/: API wrapper and helper functions
 * - tools/: Feature-organized tool modules
 *
 * Dynamic Tool Loading:
 * - WordPress REST API tools are always available (Posts, Pages, Media, Users, etc.)
 * - BanildTools file operation tools are only loaded if the plugin is detected
 */
import { createServer } from "quickmcp-sdk";
import { config } from "./config/wordpress.js";
import { checkBanildToolsAvailability } from "./utils/api.js";
import { registerPostTools } from "./tools/posts.js";
import { registerPageTools } from "./tools/pages.js";
import { registerMediaTools } from "./tools/media.js";
import { registerAllFeatureTools } from "./tools/all-features.js";
import { registerFileOperationTools } from "./tools/file-operations.js";
// Validate configuration
config.validate();
// Create MCP server
const server = createServer({
    name: "banildmcp",
    debug: true,
});
console.log("🚀 banildmcp (Banild.Ai) starting...");
console.log("🔖 Version: 2.1.2");
console.log("👤 Author: Banild.Ai");
console.log(`📡 Connected to: ${config.url}`);
console.log("");
// Check BanildTools plugin availability
console.log("🔍 Checking BanildTools plugin availability...");
const banildToolsStatus = await checkBanildToolsAvailability();
if (banildToolsStatus.available) {
    console.log(`  ✅ ${banildToolsStatus.message}`);
}
else {
    console.log(`  ⚠️  ${banildToolsStatus.message}`);
    console.log("  ℹ️  BanildTools file operations will NOT be available");
    console.log("  ℹ️  Install BanildTools plugin on WordPress for full functionality");
}
console.log("");
// Register all tool modules
console.log("📦 Loading tool modules...");
// === ALWAYS AVAILABLE: WordPress REST API Tools ===
registerPostTools(server);
console.log("  ✅ Posts (15 tools)");
registerPageTools(server);
console.log("  ✅ Pages (4 tools)");
registerMediaTools(server);
console.log("  ✅ Media (5 tools)");
registerAllFeatureTools(server);
console.log("  ✅ Users, Taxonomy, Comments, Site, SEO, CPT, WooCommerce, React (30+ tools)");
// === CONDITIONAL: BanildTools File Operations ===
let banildToolsCount = 0;
if (banildToolsStatus.available) {
    registerFileOperationTools(server);
    banildToolsCount = 23; // File ops, options, transients, server tools
    console.log(`  ✅ File Operations - BanildTools (${banildToolsCount} tools)`);
}
else {
    console.log("  ⏭️  File Operations - BanildTools (skipped - plugin not available)");
}
// Calculate totals
const coreToolsCount = 15 + 4 + 5 + 30; // Posts + Pages + Media + All Features
const totalToolsCount = coreToolsCount + banildToolsCount;
console.log("");
console.log("✅ banildmcp initialized");
console.log(`📋 Total: ${totalToolsCount} WordPress management tools loaded`);
if (!banildToolsStatus.available) {
    console.log(`   (23 additional tools available with BanildTools plugin)`);
}
console.log("");
console.log("🔧 Available Feature Categories:");
console.log("  📝 Posts: create, update, delete, publish, schedule, search, duplicate, revisions, bulk operations");
console.log("  📄 Pages: create, update, delete, hierarchy management");
console.log("  🖼️  Media: upload, get, update, delete, featured images");
console.log("  👥 Users: create, get, update, delete, role management");
console.log("  📁 Categories: create, get, update, delete, hierarchy");
console.log("  🏷️  Tags: create, get, manage");
console.log("  💬 Comments: create, get, update, delete, moderation");
console.log("  ⚙️  Settings: get, update site configuration");
console.log("  🔌 Plugins: list, install, activate, search");
console.log("  🎨 Themes: list installed themes");
console.log("  🔍 SEO: Yoast, Rank Math, All-in-One SEO support");
console.log("  🛠️  Site Management: info, connection test, custom meta");
if (banildToolsStatus.available) {
    console.log("  📂 File Operations: read, write, append, edit, delete, list, grep, glob, mkdir, rename, copy");
    console.log("  ⚙️  WordPress Options: get, set, delete options and transients");
    console.log("  🗄️  Database: read-only SQL queries");
    console.log("  🔧 Server: PHP lint, cache clear, debug log, server info");
}
else {
    console.log("  📂 File Operations: NOT AVAILABLE (requires BanildTools plugin)");
}
console.log("");
console.log("🔗 Listening for MCP requests...");
// Start server
await server.start();
//# sourceMappingURL=index.js.map