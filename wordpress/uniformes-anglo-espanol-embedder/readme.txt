=== Uniformes Anglo Español App Embedder ===
Contributors: firebasestudioai
Tags: embed, iframe, nextjs, uniformes, anglo español
Requires at least: 5.0
Tested up to: 6.5
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embeds the Uniformes Anglo Español Next.js application into WordPress using an iframe and a shortcode.

== Description ==

This plugin provides a simple way to embed your "Uniformes Anglo Español" Next.js application into any WordPress page or post. It uses an iframe and a configurable shortcode.

**Features:**
* Easy to use shortcode: `[uniformes_anglo_espanol_app]`
* Customizable URL for your Next.js application.
* Adjustable width and height for the iframe.
* Admin info page explaining usage.

**Important:** Your Next.js application must be deployed and accessible via a public URL for this plugin to work on a live website.

== Installation ==

1. Upload the `uniformes-anglo-espanol-embedder` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to a page or post where you want to embed the application.
4. Add the shortcode: `[uniformes_anglo_espanol_app url="YOUR_NEXTJS_APP_URL"]`
   * Replace `YOUR_NEXTJS_APP_URL` with the actual URL of your deployed Next.js application.
   * For local development with Next.js running on port 9002, you can use `[uniformes_anglo_espanol_app url="http://localhost:9002"]` or just `[uniformes_anglo_espanol_app]`.

== Frequently Asked Questions ==

= How do I change the URL of the Next.js app? =
Use the `url` attribute in the shortcode: `[uniformes_anglo_espanol_app url="https://your-deployed-app.com"]`

= How do I change the size of the iframe? =
Use the `width` and `height` attributes: `[uniformes_anglo_espanol_app width="100%" height="1200px"]`

== Screenshots ==
(No screenshots included in this version)

== Changelog ==

= 1.0.0 =
* Initial release. Basic shortcode for iframe embedding. Admin info page.

== Upgrade Notice ==
(No upgrade notices for the initial version)
