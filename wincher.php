<?php
/*
Plugin Name: Wincher Rank Tracker
Plugin URI: https://wordpress.org/plugins/wincher-rank-tracker
Description: Free search engine ranking tool for all your keywords. Keep an eye on your competitors, generate PDF reports, ranking history in graphs, easy sharing, and a lot more. Activate Wincher Rank Tracker to get a grip of your SEO and rankings today!
Version: 1.0
Author: Wincher
Author URI: http://wincher.com
*/


// Hook for adding admin menus
function admin_menu_hook() {
    add_menu_page ( 'Wincher', 'Wincher', 'manage_options', __FILE__ , 'main', plugin_dir_url( __FILE__ ) . 'images/logo_menu.png' , '2.34');
}
add_action('admin_menu', 'admin_menu_hook');

register_deactivation_hook( __FILE__, 'wincher_deactivate' );
function wincher_deactivate() {
    require_once dirname( __FILE__ ) . '/Wincher_API.php';
    Wincher_API::resetAccountActivation(true);


    //delete_option('wincher_api_key');
    //delete_option('wincher_email');
    //delete_option('wincher_se');
    //delete_option('wincher_api_key_verified');
    //delete_option('wincher_api_key_verify_by_email');
}

// Add block for activation of plugin on plugins page
$key = get_option('wincher_api_key');
if (empty($key)) {
    add_action('pre_current_active_plugins', 'activate_button');
}

init();

function activate_button() {
    ?><div style="font: bold 14px Arial,sans-serif; border-radius: 5px; background-color:#5a3264; padding:10px 10px 10px 225px; color:white; margin-bottom:10px; position: relative;"><div style="position: absolute; top:10px; left:10px;"><a style="display:inline-block; border-radius: 2px; padding:10px 30px; margin-right: 30px; background-color: #f19901; color:white; text-decoration: none;" href="admin.php?page=wincher/wincher.php">Start using Wincher now</a></div><div style="text-align: center; height:29px; width: 100%; padding-top: 9px;"><span>Don't miss your search engine rankings - start using Wincher now!</span></div></div><?php
}

function init() {
    add_action('admin_xml_ns', 'add_ng_app');
    function add_ng_app() {
        echo 'ng-app="app"';
    }

    add_action('admin_enqueue_scripts', 'my_enqueue');
    function my_enqueue($hook) {
        if( 'toplevel_page_wincher/wincher' != $hook) return;

        wp_register_script('angular-core', plugins_url( '/js/angular.min.js', __FILE__ ), array(), null, false);

        wp_register_script('angular-app', plugins_url( '/js/app.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('angular-route', plugins_url( '/js/angular-route.min.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('angular-sanitize', plugins_url( '/js/angular-sanitize.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('angular-ui-router', plugins_url( '/js/angular-ui-router.min.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('angular-bootstrap', plugins_url( '/js/ui-bootstrap-tpls-0.11.0.min.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('angular-file-upload-shim', plugins_url( '/js/angular-file-upload-shim.js', __FILE__ ), array(), null, false);
        wp_register_script('angular-file-upload', plugins_url( '/js/angular-file-upload.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('bootstrap', plugins_url( '/js/bootstrap.min.js', __FILE__ ), array('angular-core'), null, false);
        wp_register_script('angular-resource', plugins_url('/js/angular-resource.min.js', __FILE__) );
        wp_register_script('bootstrap', plugins_url('/js/bootstrap.js', __FILE__) );
        wp_register_script('bootstrap-datepicker', plugins_url('/js/bootstrap-datepicker.js', __FILE__) );
        wp_register_script('d3', plugins_url('/js/d3.v3.min.js', __FILE__) );

        wp_register_script('amcharts_main', 'http://cdn.amcharts.com/lib/3/amcharts.js', array(), null, false);
        wp_register_script('amcharts_serial', 'http://cdn.amcharts.com/lib/3/serial.js', array(), null, false);

        wp_register_script('underscore', plugins_url('/js/underscore-min.js', __FILE__) );
        wp_register_script('domain-service', plugins_url('/js/services/domain-service.js', __FILE__) );
        wp_register_script('competitor-service', plugins_url('/js/services/competitor-service.js', __FILE__) );
        wp_register_script('keyword-service', plugins_url('/js/services/keyword-service.js', __FILE__) );
        wp_register_script('share-service', plugins_url('/js/services/share-service.js', __FILE__) );
        wp_register_script('autoreport-service', plugins_url('/js/services/autoreport-service.js', __FILE__) );
        wp_register_script('user-service', plugins_url('/js/services/user-service.js', __FILE__) );
        wp_register_script('account-service', plugins_url('/js/services/account-service.js', __FILE__) );

        wp_register_style( 'bootstrap', plugins_url('/css/bootstrap.css', __FILE__) );
        wp_register_style( 'datepicker', plugins_url('/css/datepicker.css', __FILE__) );
        wp_register_style( 'wincher', plugins_url('/css/wincher.css', __FILE__) );


        // enqueue all scripts
        wp_enqueue_script('bootstrap-datepicker');
        wp_enqueue_script('angular-file-upload-shim');
        wp_enqueue_script('angular-core');
        wp_enqueue_script('angular-file-upload');
        wp_enqueue_script('underscore');
        wp_enqueue_script('angular-route');
        wp_enqueue_script('angular-sanitize');
        wp_enqueue_script('angular-ui-router');
        wp_enqueue_script('angular-bootstrap');


        wp_enqueue_script('bootstrap');

        wp_enqueue_script('angular-resource');
        //wp_enqueue_script('d3');
        //wp_enqueue_script('amcharts');
        wp_enqueue_script('amcharts_main');
        wp_enqueue_script('amcharts_serial');

        wp_enqueue_script('angular-app');
        wp_enqueue_script('domain-service');
        wp_enqueue_script('keyword-service');
        wp_enqueue_script('competitor-service');
        wp_enqueue_script('share-service');
        wp_enqueue_script('autoreport-service');
        wp_enqueue_script('user-service');
        wp_enqueue_script('account-service');


        wp_enqueue_style('bootstrap');
        wp_enqueue_style('datepicker');
        wp_enqueue_style('wincher');

        $title_nonce = wp_create_nonce('Some secret text which Anatoly has generated');
        wp_localize_script('angular-core', 'my_ajax_obj', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => $title_nonce,
        ));
    }

    add_action('wp_ajax_angular_proxy', 'my_ajax_handler');
    function my_ajax_handler() {
        require_once dirname( __FILE__ ) . '/Wincher_API.php';
        //check_ajax_referer('Some secret text which Anatoly has generated');
        $request_type = !empty($_REQUEST['type']) ? $_REQUEST['type'] : null;

        Wincher_API::processRequest($request_type);
        wp_die(); // all ajax handlers should die when finished
    }
}

function main() {
    require_once dirname( __FILE__ ) . '/Wincher_API.php';

    include dirname( __FILE__ ) . '/layouts/main.phtml';
}
