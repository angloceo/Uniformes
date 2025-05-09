<?php
/**
 * Plugin Name:       Uniformes Anglo Español App Embedder
 * Plugin URI:        https://example.com/
 * Description:       Embeds the Uniformes Anglo Español Next.js application into WordPress using an iframe and a shortcode.
 * Version:           1.0.0
 * Author:            Firebase Studio AI
 * Author URI:        https://firebase.google.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       uniformes-anglo-espanol-embedder
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Shortcode to display the Next.js app in an iframe.
 *
 * Usage: [uniformes_anglo_espanol_app url="YOUR_NEXTJS_APP_URL" width="100%" height="800px"]
 *
 * @param array $atts Shortcode attributes.
 * @return string HTML output for the iframe.
 */
function uniformes_anglo_espanol_embedder_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'url'    => 'http://localhost:9002', // Default URL, assumes local Next.js dev server. Change this to your deployed app's URL.
			'width'  => '100%',
			'height' => '1000px', // Default height, can be adjusted
            'frameborder' => '0',
            'title' => 'Uniformes Anglo Español App'
		),
		$atts,
		'uniformes_anglo_espanol_app'
	);

	$url = esc_url( $atts['url'] );
	$width = esc_attr( $atts['width'] );
	$height = esc_attr( $atts['height'] );
    $frameborder = esc_attr( $atts['frameborder'] );
    $title = esc_attr( $atts['title'] );

	if ( empty( $url ) ) {
		return '<p>Error: Next.js application URL is not set for the shortcode.</p>';
	}

	// Sanitize width and height to prevent XSS, allow percentages and pixels.
    $sanitized_width = preg_match('/^(\d+(px|%)?)$/', $width) ? $width : '100%';
    $sanitized_height = preg_match('/^(\d+(px|%)?)$/', $height) ? $height : '1000px';


	$iframe_html = sprintf(
		'<iframe src="%s" width="%s" height="%s" style="border:%s;" title="%s"></iframe>',
		$url,
		$sanitized_width,
		$sanitized_height,
        $frameborder, // typically '0' for no border
        $title
	);

	return $iframe_html;
}
add_shortcode( 'uniformes_anglo_espanol_app', 'uniformes_anglo_espanol_embedder_shortcode' );

/**
 * Adds a simple settings/info page for the plugin.
 */
function uniformes_anglo_espanol_embedder_menu() {
    add_menu_page(
        'Uniformes App Embedder Settings',
        'Uniformes App',
        'manage_options',
        'uniformes-app-embedder-settings',
        'uniformes_anglo_espanol_embedder_settings_page_content',
        'dashicons-cart', // You can choose a more appropriate icon
        85 // Position in menu
    );
}
add_action('admin_menu', 'uniformes_anglo_espanol_embedder_menu');

/**
 * Content for the settings/info page.
 */
function uniformes_anglo_espanol_embedder_settings_page_content() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        <p>
            <?php esc_html_e( 'This plugin allows you to embed the "Uniformes Anglo Español" Next.js application into your WordPress pages or posts using a shortcode.', 'uniformes-anglo-espanol-embedder' ); ?>
        </p>
        <h2><?php esc_html_e( 'How to Use', 'uniformes-anglo-espanol-embedder' ); ?></h2>
        <p>
            <?php esc_html_e( 'To embed the application, use the following shortcode in any page or post:', 'uniformes-anglo-espanol-embedder' ); ?>
        </p>
        <p>
            <code>[uniformes_anglo_espanol_app]</code>
        </p>
        <p>
            <?php esc_html_e( 'By default, this will attempt to load the application from:', 'uniformes-anglo-espanol-embedder' ); ?> <code>http://localhost:9002</code>.
        </p>
        <h3><?php esc_html_e( 'Customization Options', 'uniformes-anglo-espanol-embedder' ); ?></h3>
        <p>
            <?php esc_html_e( 'You can customize the embedded application by providing attributes to the shortcode:', 'uniformes-anglo-espanol-embedder' ); ?>
        </p>
        <ul>
            <li><strong>url</strong>: <?php esc_html_e( 'The full URL of your deployed Next.js application. <strong>This is important to change for a live site.</strong> Example:', 'uniformes-anglo-espanol-embedder' ); ?> <code>[uniformes_anglo_espanol_app url="https://your-nextjs-app.com"]</code></li>
            <li><strong>width</strong>: <?php esc_html_e( 'The width of the iframe (e.g., "100%", "800px"). Default: "100%". Example:', 'uniformes-anglo-espanol-embedder' ); ?> <code>[uniformes_anglo_espanol_app width="800px"]</code></li>
            <li><strong>height</strong>: <?php esc_html_e( 'The height of the iframe (e.g., "1000px", "1200px"). Default: "1000px". Example:', 'uniformes-anglo-espanol-embedder' ); ?> <code>[uniformes_anglo_espanol_app height="1200px"]</code></li>
        </ul>
        <h3><?php esc_html_e( 'Important Notes', 'uniformes-anglo-espanol-embedder' ); ?></h3>
        <ul>
            <li><?php esc_html_e( 'The Next.js application must be separately deployed and accessible at the URL you specify.', 'uniformes-anglo-espanol-embedder' ); ?></li>
            <li><?php esc_html_e( 'Embedding via iframe might have limitations regarding SEO for the embedded content and user experience on different devices.', 'uniformes-anglo-espanol-embedder' ); ?></li>
            <li><?php esc_html_e( 'Ensure the Next.js application is configured to allow embedding in an iframe if necessary (e.g., X-Frame-Options headers).', 'uniformes-anglo-espanol-embedder' ); ?></li>
        </ul>
    </div>
    <?php
}

/**
 * Activation hook.
 */
function uniformes_anglo_espanol_embedder_activate() {
    // You can add activation code here if needed, e.g., setting default options.
}
register_activation_hook( __FILE__, 'uniformes_anglo_espanol_embedder_activate' );

/**
 * Deactivation hook.
 */
function uniformes_anglo_espanol_embedder_deactivate() {
    // You can add deactivation code here if needed.
}
register_deactivation_hook( __FILE__, 'uniformes_anglo_espanol_embedder_deactivate' );

?>
