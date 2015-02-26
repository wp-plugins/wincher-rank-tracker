<?php

Class Wincher_API {
    public static $base_url = 'https://wp.wincher.com/v2/';

    public static function processRequest($request_type) {
        if (empty($request_type)) {
            $error = 'Unknown request type';
        } else {
            switch ($request_type) {
                case 'get_engines':
                    self::getEngines();
                    break;

                case 'get_tags':
                    self::getTags();
                    break;

                case 'get_account':
                    self::getAccount();
                    break;

                case 'get_account_user':
                    self::getAccountUser();
                    break;

                case 'account_activate':
                    self::activateAccount();
                    break;

                case 'account_verify':
                    self::verifyAccount();
                    break;

                case 'account_activation_reset':
                    self::resetAccountActivation();
                    break;

                case 'account_resend_verification_link':
                    self::resendVerificationLink();
                    break;

                case 'account_key_is_verified':
                    self::keyIsVerified();
                    break;

                case 'account_password':
                    self::accountPassword();
                    break;

                case 'account_passwordrecovery':
                    self::accountPasswordRecovery();
                    break;

                case 'domain_id':
                    self::getDomainId();
                    break;

                case 'domain':
                    self::getDomain();
                    break;

                case 'domain_keywords':
                    self::getDomainKeywords();
                    break;

                case 'trend':
                    self::getTrend();
                    break;

                case 'lastest_notifications':
                    self::getLatestNotifications();
                    break;

                case 'notifications':
                    self::getNotifications();
                    break;

                case 'chart':
                    self::getChart();
                    break;

                case 'chart_raw':
                    self::getChartRaw();
                    break;

                case 'keyword_chart':
                    self::getKeywordChart();
                    break;

                case 'keyword_chart_raw':
                    self::getKeywordChartRaw();
                    break;

                case 'add_competitor':
                    self::addCompetitor();
                    break;

                case 'delete_competitor':
                    self::deleteCompetitor();
                    break;

                case 'add_keyword':
                    self::addKeyword();
                    break;

                case 'add_keyword_bulk':
                    self::addKeywordBulk();
                    break;

                case 'add_keyword_bulk_file':
                    self::addKeywordBulkFile();
                    break;

                case 'delete_keyword':
                    self::deleteKeyword();
                    break;

                // keyword id by domainId and keyword name
                case 'keyword_id':
                    self::getKeywordId();
                    break;

                // Google stats
                case 'keyword_serp':
                    self::getKeywordSerp();
                    break;

                case 'keyword_track':
                    self::getKeywordTrack();
                    break;

                case 'autoreport':
                    self::getAutoreport();
                    break;

                case 'autoreport_edit':
                    self::setAutoreport();
                    break;

                case 'autoreport_image':
                    self::getAutoreportImage();
                    break;

                case 'autoreport_edit_file':
                    self::setAutoreportFile();
                    break;

                // Google stats
                case 'domain_csv':
                    self::getDomainCsv();
                    break;

                // Google stats
                case 'domain_pdf':
                    self::getDomainPdf();
                    break;

                case 'get_current_user_name':
                    self::getCurrentUserName();
                    break;

                case 'share_email':
                    self::shareEmail();
                    break;

                case 'send_graph_email':
                    self::sendGraphEmail();
                    break;

                case 'share_twitter':
                    self::shareTwitter();
                    break;

                case 'share_facebook':
                    self::shareFacebook();
                    break;

            }
        }
    }

    public static function requestApi($request_data, $add_content_headers = true, $debug = false) {
        if (is_array($request_data['args'])) {
            $content = json_encode($request_data['args']);
        } else {
            $content = $request_data['args'];
        }

        $headers = !empty($add_content_headers)
            ? array(
                'Content-Type' => 'application/json',
                'Content-Length' => strlen($content),
            )
            : array();

        if (!empty($request_data['headers'])) {
            $headers = array_merge($headers, $request_data['headers']);
        }

        $args = array(
            'timeout'     => 60,
            'redirection' => 60,
            'httpversion' => '1.1',
            'headers' => $headers,
            'body' => $content
        );

        if ($request_data['method'] == 'GET') {
            $response = wp_remote_get($request_data['url'], $args);
        } else {
            $response = wp_remote_post($request_data['url'], $args);
        }

        if (!empty($debug)) {
            var_dump($request_data['url'], $args, $response);
        }

        if (is_wp_error($response)) {
            $error1 = $response->get_error_message('http_request_failed');

            if ($request_data['method'] == 'GET') {
                $response2 = wp_remote_get($request_data['url'], $args);
            } else {
                $response2 = wp_remote_post($request_data['url'], $args);
            }

            if (is_wp_error($response)) {
                $error2 = $response2->get_error_message('http_request_failed');
                $response = array(
                    'body' => '{"Message":"' . $error1 . " + " . $error2 . '"}',
                    'response' => array(
                        'code' => 400,
                    )
                );
            } else {
                $response = $response2;
            }
        }

        return $response;
    }

    public static function getEngines() {
        $request_fields = array();
        $url = 'searchengine/all';
        $method = 'GET';

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getTags() {

        $tags_parsed = '';
        $tags = array_slice(get_tags(array('orderby' => 'count', 'order' => 'DESC')),0,5);

        foreach($tags as $tag) {
            $tags_parsed .= $tag->name . "\n";
        }

        $result = array(
            'success' => true,
            'data' => $tags_parsed,
        );

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function activateAccount() {
        $request_fields = array(
            "Email"             => $_REQUEST["Email"],
            "DomainName"        => self::getSiteDomain(),
            "SearchEngineId"    => intval($_REQUEST["SearchEngineId"]),
            "Keywords"          => !empty($_REQUEST["Keywords"]) ? explode("\n", trim($_REQUEST["Keywords"])) : null,
            "Competitors"       => !empty($_REQUEST["Competitors"]) ? explode("\n", trim($_REQUEST["Competitors"])) : null,
            "FirstName"         => $_REQUEST["FirstName"],
            "LastName"          => $_REQUEST["LastName"],
        );

        $url = 'register';
        $method = 'POST';

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );

            if ($response['response']['code'] == 409) {
                // User exists, domain exists but key is not verified
                add_option('wincher_api_key_verified', false);
                add_option('wincher_api_key', $response_body['Message']);
                add_option('wincher_email', $request_fields['Email']);
                add_option('wincher_se', $request_fields['SearchEngineId']);

                $result = array(
                    'success' => true,
                    'key_verified' => false,
                    'email' => $request_fields['Email'],
                );
            }

            if ($response['response']['code'] == 426) {
                // User exists, domain is not created
                // We don't save any data, just show message

                $result = array(
                    'success' => false,
                    'error' => $response_body['Message'],
                    'show_update' => strcmp('PACKAGE_STANDARD', $response_body['AccountType']),
                    'has_password' => $response_body['HasPassword'],
                    'login_url' => $response_body['LoginUrl'],
                );
            }
        } else {
            add_option('wincher_api_key_verified', true);
            add_option('wincher_api_key', $response_body);
            add_option('wincher_email', $request_fields['Email']);
            add_option('wincher_se', $request_fields['SearchEngineId']);

            $result = array(
                'success' => true,
                'key_verified' => true,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function verifyAccount() {
        $request_fields = array(
            "Email"     => $_REQUEST["Email"],
            "Password"  => $_REQUEST["Password"],
            "VerifyBy"  => $_REQUEST["VerifyBy"],
        );

        $key = get_option('wincher_api_key', false);
        if (empty($key)) {
            $result = array(
                'success' => false,
                'error' => "Unknown API key",
            );
        } else {

            $request_fields['Key'] = $key;

            if ($request_fields["VerifyBy"] == 'email') {
                $result = self::_verifyAccountByEmail($request_fields);
            } elseif ($request_fields["VerifyBy"] == 'password') {
                    $result = self::_verifyAccountByPassword($request_fields);
            } else {
                $result = array(
                    'success' => false,
                    'error' => "Unknown verification method",
                );
            }
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function accountPassword() {
        $request_fields = array(
            "Password" => $_REQUEST["Password"],
        );

        $url = 'accountuser/password';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => array(),
            'url' => self::$base_url . $url . '?password=' . $request_fields['Password'],
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200 && $response['response']['code'] != 204) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );

        } else {
            $result = array(
                'success' => true,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function accountPasswordRecovery() {
        $request_fields = array(
            "Email"     => $_REQUEST["Email"],
        );

        $url = 'accountuser/passwordrecovery';
        $method = 'POST';

        $response = self::requestApi(array(
            'args' => array(),
            'url' => self::$base_url . $url . '?email=' . urlencode($request_fields['Email']),
            'method' => $method,
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );

        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    private function _verifyAccountByPassword($request_fields) {
        $url = 'key/verifybypassword';
        $method = 'POST';

        $response = self::requestApi(array(
            'args' => array(
                "Email"     => $request_fields["Email"],
                "Password"  => $request_fields["Password"],
                "Key"       => $request_fields["Key"],
            ),
            'url' => self::$base_url . $url,
            'method' => $method
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 201) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );

            if ($response['response']['code'] == 401) {
                $result['code'] = 'password_wrong';
            }
        } else {

            update_option('wincher_api_key_verified', true);

            $result = array(
                'success' => true,
                'key_verified' => true,
            );
        }

        return $result;
    }

    private function _verifyAccountByEmail($request_fields) {
        $url = 'key/verifybyemail';
        $method = 'POST';

        $callback_url = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https://' : 'http://') . $_SERVER["HTTP_HOST"] . '/wp-admin/admin.php?page=' . PLUGIN_NAME . '/wincher.php';

        $response = self::requestApi(array(
            'args' => array(
                "PluginCallback"    => $callback_url,
                "Key"               => $request_fields["Key"],
            ),
            'url' => self::$base_url . $url,
            'method' => $method
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200 && $response['response']['code'] != 202) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $key_verified = false;
            update_option('wincher_api_key_verify_by_email', true);

            if ($response['response']['code'] == 200) {
                $key_verified = true;
                update_option('wincher_api_key_verified', true);
            }

            $result = array(
                'success' => true,
                'key_verified' => $key_verified
            );
        }

        return $result;
    }

    public static function resetAccountActivation($quiet = false) {

        try {
            delete_option('wincher_api_key');
            delete_option('wincher_email');
            delete_option('wincher_se');
            delete_option('wincher_api_key_verified');
            delete_option('wincher_api_key_verify_by_email');

            $result = array(
                'success' => true
            );

        } catch(Exception $e) {
            $result = array(
                "success" => false,
                "error" => $e->getMessage(),
            );
        }

        if (!empty($quiet)) {
            return;
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function resendVerificationLink() {

        $key = get_option('wincher_api_key');

        if (empty($key)) {
            $result = array(
                'success' => false,
                'error' => "Unknown API key",
            );
        } else {
            $result = self::_verifyAccountByEmail(array("Key" => $key));
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function keyIsVerified() {
        $request_fields = array();
        $url = 'key/verified';
        $method = 'GET';

        $key = get_option('wincher_api_key');

        if (empty($key)) {
            $result = array(
                'success' => false,
                'error' => "Unknown API key",
            );
        } else {

            $response = self::requestApi(array(
                'args' => $request_fields,
                'url' => self::$base_url . $url . '?key=' . $key,
                'method' => $method,
            ));

            $response_body = json_decode($response['body'], true);

            if ($response['response']['code'] != 200) {
                if ($response['response']['code'] != 400) {
                    if (false !== strpos($response_body['Message'], 'No HTTP resource was found that matches the request URI')) {
                        $response_body['Message'] = substr($response_body['Message'], 0, 115) . '...';
                    }
                    $result = array(
                        'success' => false,
                        'error' => $response_body['Message'],
                    );
                } else {
                    $result = array(
                        'success' => true,
                        'key_verified' => false,
                    );
                }
            } else {
                update_option('wincher_api_key_verified', true);
                $result = array(
                    'success' => true,
                    'key_verified' => true,
                );
            }
        }



        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public function getDomainId() {
        $request_fields = array();
        $url = 'domain/all';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            )
        ));

        $response_body = json_decode($response['body'], true);

        if (empty($response_body) || empty($response_body[0])) {
            header('Content-type: application/json;');
            echo json_encode('{"success":"false","error":"No domains for this account}');
            return;
        }

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $domain = self::getSiteDomain();
            if (FALSE === strpos($domain, 'http://')) {
                $domain = 'http://' . $domain;
            }

            $domain = parse_url($domain);
            $domain_original = $domain['host'];
            $domain = (0 === strpos($domain['host'], 'www.') ? str_replace('www.', '', $domain['host']) : $domain['host']);
            $se = get_option('wincher_se');

            $wincher_domains = array();

            foreach($response_body as $wincher_domain) {
                if (FALSE === strpos($wincher_domain['DomainName'], 'http://')) {
                    $wincher_domain['DomainName'] = 'http://' . $wincher_domain['DomainName'];
                }
                $wincher_domain_parsed = parse_url($wincher_domain['DomainName']);

                if (!empty($wincher_domain_parsed['host'])) {
                    $non_www = (0 === strpos($wincher_domain_parsed['host'], 'www.') ? str_replace('www.', '', $wincher_domain_parsed['host']) : $wincher_domain_parsed['host']);
                    $wincher_domains[] = array(
                        'non_www' => $non_www,
                        'original' => $wincher_domain_parsed['host'],
                        'data' => $wincher_domain,
                    );
                }
            }

            $match = false;
            $exact = false;
            foreach ($wincher_domains as $wincher_domain) {
                if (!strcmp($domain, $wincher_domain['non_www']) && $wincher_domain['data']['SearchEngineId'] == $se) {
                    $new_exact = !strcmp($domain_original, $wincher_domain['original']);
                    if ($new_exact || !$exact) {
                        $match = $wincher_domain['data'];
                        $exact = $new_exact;
                    }
                }
            }

            if (empty($match)) {
                if (!empty($response_body[0])) {
                    $match = $response_body[0];
                } else {
                    header('Content-type: application/json;');
                    echo json_encode('{"success":"false","error":"No domains for this account}');
                    return;
                }

            }

            $result = array(
                'success' => true,
                'data' => $match,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public function getDomain() {
        $request_fields = array(
            "AccountDomainId"                   => intval($_REQUEST["AccountDomainId"]),
            "OrderBy"                           => $_REQUEST["OrderBy"],
            "GraphInterval"                     => intval($_REQUEST["GraphInterval"]),
            "Page"                              => intval($_REQUEST["Page"]),
            "ResultsPerPage"                    => intval($_REQUEST["ResultsPerPage"]),
            "Height"                            => intval($_REQUEST["Height"]),
            "SelectedAccountDomainKeywordId"    => $_REQUEST["SelectedAccountDomainKeywordId"],
        );

        $url = 'domain';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            )
        ));

        $response_body = json_decode($response['body'], true);


        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            if (empty($response_body["SelectedSummaryInterval"])) {
                $response_body["SelectedSummaryInterval"] = "LAST_WEEK";
            }

            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public function getDomainKeywords() {
        $request_fields = array(
            "AccountDomainId"                   => intval($_REQUEST["AccountDomainId"]),
        );

        $url = 'domain/keywords';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            )
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getTrend() {
        $request_fields = array(
            "AccountDomainId"   => intval($_REQUEST["AccountDomainId"]),
            "GraphInterval"     => intval($_REQUEST["GraphInterval"]),
        );
        $url = 'domain/trend';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getLatestNotifications() {
        $request_fields = array(
            "AccountDomainId"   => intval($_REQUEST["AccountDomainId"]),
            "Count"             => intval($_REQUEST["Count"]),
        );
        $url = 'domain/lastNotifications';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getNotifications() {
        $request_fields = array(
            "AccountDomainId"   => intval($_REQUEST["id"]),
            "page"             => intval($_REQUEST["page"]),
        );
        $url = 'domain/notifications';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getChart() {
        $request_fields = array(
            "AccountDomainId"   => intval($_REQUEST["AccountDomainId"]),
            "Height"            => $_REQUEST["Height"],
            "Page"              => $_REQUEST["Page"],
            "ResultsPerPage"    => $_REQUEST["ResultsPerPage"],
            "OrderBy"           => $_REQUEST["OrderBy"],
            "GraphInterval"     => $_REQUEST["GraphInterval"],
        );
        $url = 'chart';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $response_body = str_replace(array('$(','$.', '$('), array('jQuery(', 'jQuery.', 'jQuery('), $response_body);
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getChartRaw() {
        $request_fields = array(
            "AccountDomainId"   => intval($_REQUEST["AccountDomainId"]),
            "Height"            => $_REQUEST["Height"],
            "Page"              => $_REQUEST["Page"],
            "ResultsPerPage"    => $_REQUEST["ResultsPerPage"],
            "OrderBy"           => $_REQUEST["OrderBy"],
            "GraphInterval"     => $_REQUEST["GraphInterval"],
        );
        $url = 'rank';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode(str_replace("T00:00:00", "", $response['body']), true);

        $bullet_types = array("round", "square", "triangleUp", "triangleLeft", "triangleRight", "triangleDown");

        $graph_template = array(
            "balloonText" => "<b>{{Keyword}}</b><br /><b>Date:</b> [[date]]<br /><b>Position:</b> [[value]]",
			"bulletSize" => 6,
            "fixedColumnWidth" => -1,
            "id" => "{{Keyword}}",
            "lineThickness" => 3,
            "title" => "{{Keyword}}",
            "type" => "smoothedLine",
            "valueField" => "{{Keyword}}",
        );


        $graphs = array();
        $data_parsed = array();
        foreach ($response_body as $row) {
            foreach ($row['Values'] as $data) {
                $data_parsed[$data['Date']]['date'] = $data['Date'];
                $data_parsed[$data['Date']][$row['Label']] = $data['Position'];
            }
            $bullet = $bullet_types[array_rand($bullet_types)];
            $tmp = $graph_template;
            $tmp['balloonText'] = str_replace('{{Keyword}}', $row['Label'], $tmp['balloonText']);
            $tmp['id']          = str_replace('{{Keyword}}', $row['Label'], $tmp['id']);
            $tmp['title']       = str_replace('{{Keyword}}', $row['Label'], $tmp['title']);
            $tmp['valueField']  = str_replace('{{Keyword}}', $row['Label'], $tmp['valueField']);
            $tmp["bullet"]      = (!empty($bullet) ? $bullet : 'round');
            $graphs[] = $tmp;
        }

        ksort($data_parsed);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => array(
                    'graphs' => $graphs,
                    'data' => array_values($data_parsed),
                ),
                //'data' => $data,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getKeywordChart() {
        $request_fields = array(
            "SelectedAccountDomainKeywordId" => intval($_REQUEST["SelectedAccountDomainKeywordId"]),
            "Height"            => intval($_REQUEST["Height"]),
            "GraphInterval"     => intval($_REQUEST["GraphInterval"]),
            "IncludeCompetitors"=> (boolean) $_REQUEST["IncludeCompetitors"],
        );

        $url = 'chart/keyword';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $response_body = str_replace(array('$(','$.', '$('), array('jQuery(', 'jQuery.', 'jQuery('), $response_body);
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getKeywordChartRaw() {
        $request_fields = array(
            "SelectedAccountDomainKeywordId" => intval($_REQUEST["SelectedAccountDomainKeywordId"]),
            "Height"            => intval($_REQUEST["Height"]),
            "GraphInterval"     => intval($_REQUEST["GraphInterval"]),
            "IncludeCompetitors"=> (boolean) $_REQUEST["IncludeCompetitors"],
        );

        $url = 'rank/keyword';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode(str_replace("T00:00:00", "", $response['body']), true);

        $bullet_types = array("round", "square", "triangleUp", "triangleLeft", "triangleRight", "triangleDown");

        $graph_template = array(
            "balloonText" => "<b>{{Keyword}}</b><br /><b>Date:</b> [[date]]<br /><b>Position:</b> [[value]]",
            "bulletSize" => 6,
            "fixedColumnWidth" => -1,
            "id" => "{{Keyword}}",
            "lineThickness" => 3,
            "title" => "{{Keyword}}",
            "type" => "smoothedLine",
            "valueField" => "{{Keyword}}",
        );


        $graphs = array();
        $data_parsed = array();
        foreach ($response_body as $row) {
            foreach ($row['Values'] as $data) {
                $data_parsed[$data['Date']]['date'] = $data['Date'];
                $data_parsed[$data['Date']][$row['Label']] = $data['Position'];
            }
            $bullet = $bullet_types[array_rand($bullet_types)];
            $tmp = $graph_template;
            $tmp['balloonText'] = str_replace('{{Keyword}}', $row['Label'], $tmp['balloonText']);
            $tmp['id']          = str_replace('{{Keyword}}', $row['Label'], $tmp['id']);
            $tmp['title']       = str_replace('{{Keyword}}', $row['Label'], $tmp['title']);
            $tmp['valueField']  = str_replace('{{Keyword}}', $row['Label'], $tmp['valueField']);
            $tmp["bullet"]      = (!empty($bullet) ? $bullet : 'round');
            $graphs[] = $tmp;
        }

        //$config['graphs'] = $graphs;
        //$config['dataProvider'] = array_values($data_parsed);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => array(
                    'graphs' => $graphs,
                    'data' => array_values($data_parsed),
                ),
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function AddCompetitor() {
        $request_fields = array(
            "CompetitorDomainId"    => intval($_REQUEST["CompetitorDomainId"]),
            "DomainName"            => urldecode($_REQUEST["DomainName"]),
            "AccountDomainId"       => intval($_REQUEST["AccountDomainId"]),
            "Id"                    => intval($_REQUEST["Id"]),
        );
        $url = 'competitor';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function addKeyword() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["AccountDomainId"]),
            "Keyword" => urldecode($_REQUEST["Keyword"]),
        );
        $url = 'keyword';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] != 201) {
            $response_body = json_decode($response_body, true);
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'Message' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function addKeywordBulk() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["AccountDomainId"]),
            "Keywords" => explode(',',urldecode($_REQUEST["Keywords"])),
        );

        $url = 'keyword/bulk';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] != 201) {
            $response_body = json_decode($response_body, true);
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function addKeywordBulkFile() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["AccountDomainId"]),
        );

        if (empty($_FILES["file"]) || !empty($_FILES["file"]['error'])) {
            $result = array(
                'success' => false,
                'error' => 'Some error occurred',
            );
        } else {
            $keywords = array();
            $handle = @fopen($_FILES["file"]['tmp_name'], "r");
            if ($handle) {
                while (($buffer = fgets($handle, 4096)) !== false) {
                    $keywords[] = str_replace(array("\n", "\r"), '', $buffer);
                }
                if (!feof($handle)) {
                    echo "Error: unexpected fgets() fail\n";
                }
                fclose($handle);
            }

            $result = array(
                'success' => true,
                'data' => array_filter($keywords),
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function deleteCompetitor() {
        $url = 'competitor/delete';
        $method = 'DELETE';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'url' => self::$base_url . $url . '?id=' . intval($_REQUEST["Id"]),
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function deleteKeyword() {
        $request_fields = array(
            "AccountDomainKeywordId" => intval($_REQUEST["Id"]),
        );
        $url = 'keyword/delete';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getKeywordSerp() {
        $request_fields = array(
            "AccountDomainKeywordId" => intval($_REQUEST["Id"]),
        );
        $url = 'keyword/serp';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getKeywordTrack() {
        $request_fields = array(
            "AccountDomainKeywordId" => intval($_REQUEST["Id"]),
        );
        $url = 'keyword/track';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ), true, true);

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200 && $response['response']['code'] != 204) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getKeywordId() {
        $request_fields = array(
            "Keyword" => $_REQUEST["Keyword"],
            "AccountDomainId" => intval($_REQUEST["AccountDomainId"]),
        );
        $url = 'keyword/accountdomainkeywordid';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getAutoreport() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["Id"]),
        );
        $url = 'autoreport';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function setAutoreport() {
        $request_fields = array(
            'Id' => -1,
            "AccountDomainId" => intval($_REQUEST["AccountDomainId"]),
            "SendInterval" => intval($_REQUEST["SendInterval"]),
            "DayOfWeekToSend" => intval($_REQUEST["DayOfWeekToSend"]),
            "SendTo" => $_REQUEST["SendTo"],
            "LogoId" => intval($_REQUEST["LogoId"]),
            "Enabled" => (boolean) $_REQUEST["Enabled"],
        );

        $url = 'autoreport';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }
    public static function getAutoreportImage() {
        $request_fields = array(
            "Id" => intval($_REQUEST["Id"]),
        );
        $url = 'image';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url . '?id=' . intval($_REQUEST["Id"]),
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = $response['body'];

        if ($response['response']['code'] == 200) {
            echo $response['body'];
            return;
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }


        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function setAutoreportFile() {
        $request_fields = array();

        $url = 'autoreport/uploadlogo';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        if (empty($_FILES["file"]) || !empty($_FILES["file"]['error'])) {
            $result = array(
                'success' => false,
                'error' => 'Some error occurred',
            );
        } else {
            $local_file = $_FILES["file"]['tmp_name'];
            $post_fields = $request_fields;
            $boundary = wp_generate_password( 24 );
            $headers  = array(
                'Content-Type' => 'multipart/form-data; boundary=' . $boundary
            );
            $payload = '';
            // First, add the standard POST fields:
            foreach ( $post_fields as $name => $value ) {
                $payload .= '--' . $boundary;
                $payload .= "\r\n";
                $payload .= 'Content-Disposition: form-data; name="' . $name .
                    '"' . "\r\n\r\n";
                $payload .= $value;
                $payload .= "\r\n";
            }
            // Upload the file
            if ( $local_file ) {
                $payload .= '--' . $boundary;
                $payload .= "\r\n";
                $payload .= 'Content-Disposition: form-data; name="' . 'upload' .
                    '"; filename="' . $_FILES["file"]['name'] . '"' . "\r\n";
                if (!empty($_FILES["file"]['type'])) {
                    $payload .= 'Content-Type: ' . $_FILES["file"]['type'] . "\r\n";
                }
                $payload .= "\r\n";
                $payload .= file_get_contents( $local_file );
                $payload .= "\r\n";
            }
            $payload .= '--' . $boundary . '--';
            $headers['Content-Length'] = strlen($payload);

            $response = self::requestApi(array(
                'args' => $payload,
                'url' => self::$base_url . $url,
                'method' => $method,
                'headers' => array_merge(array('Authorization' => "Basic " . base64_encode($email .  ':' . $key)), $headers),
            ), false);

            $response_body = json_decode($response['body'], true);

            if ($response['response']['code'] != 200) {
                $result = array(
                    'success' => false,
                    'error' => $response_body['Message'],
                );
            } else {
                $result = array(
                    'success' => true,
                    'data' => $response_body,
                );
            }
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public function getDomainCsv() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["Id"]),
            "from" => $_REQUEST["from"],
            "to" => $_REQUEST["to"],
        );
        $url = 'domain/csv';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));
        $response_body = $response['body'];

        if (!empty($response['headers']['content-disposition'])) {
            header("Content-Disposition: " . $response['headers']['content-disposition']);
        }

        header("Content-Type: text/csv");
        header("Content-Length: " . strlen($response_body));
        echo $response_body;
        wp_die();
    }

    public function getDomainPdf() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["Id"]),
            "from" => $_REQUEST["from"],
            "to" => $_REQUEST["to"],
        );
        $url = 'domain/pdf';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));
        $response_body = $response['body'];

        header("Content-Type: application/pdf");
        header("Content-Length: " . strlen($response_body));

        echo $response_body;
        wp_die();
    }

    public static function getSiteDomain() {
        $domain = get_option('siteurl');

        if (FALSE === strpos($domain, 'http://') && FALSE === strpos($domain, 'https://')) {
            $domain = 'http://' . $domain;
        }

        $domain = parse_url($domain);

        if (!empty($domain['host']) && strcmp('wp-test', $domain['host'])) {
            return $domain['host'];
        } else {
            //return 'solidfiles.com';
            //return 'twitter.com';
            //return 'wp-test.wincher.com';
            //return 'dietguiden.com';
            //return "facebook.com";
            return "www.wincher.com";
            //return "whiskykritikerna.se";
            //return "solidfiles.com";
            //return "wp-test.wincher.com";
        }
    }

    public static function getCurrentUserName() {
        $request_fields = array();
        $url = 'accountuser/username';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => trim($response_body),
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getAccount() {
        $request_fields = array();
        $url = 'account';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            if ($response['response']['code'] == 406) {
                $result = array(
                    'success' => true,
                    'account_closed' => $response_body['Message'],
                );
            } else {
                $result = array(
                    'success' => false,
                    'error' => $response_body['Message'],
                );
            }
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
                'account_closed' => false,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function getAccountUser() {
        $request_fields = array();
        $url = 'accountuser';
        $method = 'GET';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function shareEmail() {
        $request_fields = array(
            "SuccessId" => intval($_REQUEST["SuccessId"]),
            "EmailTo" => $_REQUEST["EmailTo"],
            "From" => $_REQUEST["From"],
        );

        $url = 'share/email';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200 && $response['response']['code'] != 204) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function sendGraphEmail() {
        $request_fields = array(
            "AccountDomainId" => intval($_REQUEST["AccountDomainId"]),
            "GraphInterval" => intval($_REQUEST["GraphInterval"]),
            "EmailTo" => $_REQUEST["EmailTo"],
            "From" => $_REQUEST["From"],
        );

        $url = 'domain/sendgraph';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url,
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200 && $response['response']['code'] != 204) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function shareTwitter() {
        $request_fields = array();

        $url = 'share/twitter';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url . '?successId=' . intval($_REQUEST["Id"]),
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }

    public static function shareFacebook() {
        $request_fields = array();

        $url = 'share/facebook';
        $method = 'POST';

        $email = get_option('wincher_email');
        $key = get_option('wincher_api_key');

        $response = self::requestApi(array(
            'args' => $request_fields,
            'url' => self::$base_url . $url . '?successId=' . intval($_REQUEST["Id"]),
            'method' => $method,
            'headers' => array(
                'Authorization' => "Basic " . base64_encode($email .  ':' . $key)
            ),
        ));

        $response_body = json_decode($response['body'], true);

        if ($response['response']['code'] != 200) {
            $result = array(
                'success' => false,
                'error' => $response_body['Message'],
            );
        } else {
            $result = array(
                'success' => true,
                'data' => $response_body,
            );
        }

        header('Content-type: application/json;');
        echo json_encode($result);
    }
}
