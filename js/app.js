'use strict';

angular.module('app', [
        'ngRoute',
        'ui.router',
        'ui.bootstrap',
        'ngSanitize',
        'angularFileUpload'
    ])
    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'config',
        function ($stateProvider, $locationProvider, $urlRouterProvider, config) {
            var default_state = (config.HAS_KEY_VERIFIED ? 'dashboard' : 'activate');
            $urlRouterProvider.otherwise(default_state);
            $locationProvider.html5Mode(false);

            $stateProvider.state('activate', {
                templateUrl: config.BASE_PATH + 'templates/activate/blury.html',
                url: '/activate',
                controller: ["$scope", "$http", "$sce", "$state", "$modal", "config", "$rootScope", function($scope, $http, $sce, $state, $modal, config, $rootScope) {

                    if (config.HAS_KEY_VERIFIED) {
                        $state.transitionTo('dashboard', null, {reload: true});
                        return;
                    }
                    if (config.HAS_EMAIL_VERIFICATION_REQUEST) {
                        $state.transitionTo('verify:email_not_verified', null, {reload: true});
                        return;
                    }
                    if (config.HAS_KEY) {
                        $state.transitionTo('verify', null, {reload: true});
                        return;
                    }

                    $scope.config = config;

                    $modal.open({
                        templateUrl: config.BASE_PATH + 'templates/activate/popup_activate.html',
                        index: 100,
                        controller: ['$scope', '$modalInstance', 'domainService', 'config',
                            function ($scope, $modalInstance, domainService, config) {

                                $scope.config = config;
                                $scope.resource = {"email":(config.USER_INFO.email ? config.USER_INFO.email : ""),"engine":-1, "first_name":(config.USER_INFO.first ? config.USER_INFO.first : ""), "last_name":(config.USER_INFO.last ? config.USER_INFO.last : "")};
                                $scope.popupMainLoading = true;
                                $scope.activateErrorMessage = null;
                                $scope.activateSuccessMessage = null;
                                $scope.activateShowRequestPassword = null;
                                $scope.activateShowUpdate = null;

                                $http.post(my_ajax_obj.ajax_url,
                                    "_ajax_nonce="  + my_ajax_obj.nonce + "&action=angular_proxy&type=get_engines",
                                    {headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }}
                                ).
                                    success(function(response) {
                                        if (response.success) {
                                            $scope.engines = response.data;
                                            $scope.resource.engine = response.data[0].Id;
                                        } else {
                                            $scope.engines = [{"Id": -1, "Name" : "No records found"}];
                                            $scope.activateErrorMessage = $sce.trustAsHtml(response.error);
                                        }

                                        $http.post(my_ajax_obj.ajax_url,
                                            "_ajax_nonce="  + my_ajax_obj.nonce + "&action=angular_proxy&type=get_tags",
                                            {headers: {
                                                'Content-Type': 'application/x-www-form-urlencoded'
                                            }}
                                        ).
                                            success(function(response) {
                                                if (response.success) {
                                                    $scope.resource.keywords = response.data;
                                                } else {
                                                    $scope.resource.keywords = '';
                                                }

                                                $scope.popupMainLoading = false;
                                            });
                                    });

                                $scope.cancel = function () {
                                    $scope.activateErrorMessage = null;
                                    $scope.activateSuccessMessage = null;
                                    $scope.activateShowRequestPassword = null;
                                    $scope.activateShowUpdate = null;

                                    $modalInstance.dismiss('cancel');
                                };

                                $scope.activate_next = function () {
                                    if (!config.HAS_PASSWORD) {

                                        $scope.popupLoading = true;

                                        $http.post(my_ajax_obj.ajax_url,
                                            "_ajax_nonce="  + my_ajax_obj.nonce +
                                                "&action=angular_proxy" +
                                                "&type=account_passwordrecovery" +
                                                "&Email=" + encodeURIComponent($scope.resource.email),
                                            {headers: {
                                                'Content-Type': 'application/x-www-form-urlencoded'
                                            }}
                                        ).
                                            success(function(response) {
                                                $scope.popupLoading = false;

                                                $scope.activateErrorMessage = null;
                                                $scope.activateShowRequestPassword = null;
                                                $scope.activateShowUpdate = null;
                                                $scope.activateSuccessMessage = null;

                                                if (response.success) {
                                                    $scope.activateSuccessMessage = response.data;
                                                } else {
                                                    $scope.activateErrorMessage = response.error;
                                                }
                                            }).
                                            error(function(data, status, headers, config) {
                                                $scope.activateErrorMessage = response.error;
                                            });
                                    } else {
                                        if (config.LOGIN_URL) {
                                            window.open(config.LOGIN_URL, '_blank');
                                        }
                                    }
                                };

                                $scope.activate = function (form) {
                                    $scope.popupLoading = true;

                                    $scope.activateErrorMessage = null;
                                    $scope.activateSuccessMessage = null;
                                    $scope.activateShowRequestPassword = null;
                                    $scope.activateShowUpdate = null;

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                            "&action=angular_proxy" +
                                            "&type=account_activate" +
                                            "&Email=" + encodeURIComponent($scope.resource.email) +
                                            "&SearchEngineId=" + $scope.resource.engine +
                                            "&Keywords=" + ($scope.resource.keywords ? encodeURIComponent($scope.resource.keywords) : null) +
                                            "&Competitors=" + ($scope.resource.competitors ? encodeURIComponent($scope.resource.competitors) : "") +
                                            "&FirstName=" + ($scope.resource.first_name ? encodeURIComponent($scope.resource.first_name) : "") +
                                            "&LastName=" + ($scope.resource.last_name ? encodeURIComponent($scope.resource.last_name) : ""),
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupLoading = false;
                                            if (response.success) {
                                                config.HAS_KEY = true;
                                                if (response.key_verified) {
                                                    config.HAS_KEY_VERIFIED = true;
                                                    $modalInstance.close();
                                                    $state.transitionTo('dashboard', null, {reload: true});
                                                } else {
                                                    $modalInstance.close();
                                                    config.ACCOUNT_EMAIL = response.email;
                                                    $state.transitionTo('verify', null, {reload: true});
                                                }
                                            } else {
                                                $scope.activateErrorMessage = $sce.trustAsHtml(response.error);
                                                $scope.activateShowRequestPassword = response.show_update && !response.has_password ? true : null;
                                                $scope.activateShowUpdate = response.show_update && response.has_password ? true : null;
                                                config.HAS_PASSWORD = response.has_password;
                                                config.LOGIN_URL = response.login_url;
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.activateErrorMessage = $sce.trustAsHtml(response.error);
                                            $scope.activateShowRequestPassword = response.show_update && !response.has_password ? true : null;
                                            $scope.activateShowUpdate = response.show_update && response.has_password ? true : null;
                                            config.HAS_PASSWORD = response.has_password;
                                            config.LOGIN_URL = response.login_url;
                                        });
                                };
                            }],
                        windowClass: 'w630px',
                        backdrop: 'static'
                    });
                }]
            })
            /*.state('password', {
                templateUrl: config.BASE_PATH + 'templates/activate/blury.html',
                url: '/password',
                controller: ["$scope", "$http", "$state", "$modal", "config", "$stateParams", "$rootScope", function($scope, $http, $state, $modal, config, $stateParams, $rootScope) {
                    if (config.HAS_PASSWORD) {
                        $state.transitionTo('activate', null, {reload: true});
                        return;
                    }

                    $scope.config = config;

                    $scope.resource = {email: config.ACCOUNT_EMAIL, verify_by: "password"};

                    $modal.open({
                        templateUrl: config.BASE_PATH + 'templates/activate/popup_password.html',
                        controller: ['$scope', '$modalInstance', 'domainService', 'config', 'resource',
                            function ($scope, $modalInstance, domainService, config, resource) {

                                $scope.config = config;
                                $scope.resource = resource;
                                $scope.passwordErrorMessage = null;
                                $scope.popupPasswordLoading = false;

                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };

                                $scope.confirm = function (form) {
                                    $scope.popupPasswordLoading = true;

                                    $scope.password_sent = function() {
                                        $modal.open({
                                            templateUrl: config.BASE_PATH + 'templates/activate/popup_email_sent.html',
                                            controller: function() {},
                                            windowClass: 'w400px',
                                            backdrop: 'static'
                                        });
                                    }

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                        "&action=angular_proxy" +
                                        "&type=account_password" +
                                        "&Password=" + encodeURIComponent($scope.resource.password),
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupPasswordLoading = false;

                                            if (response.success) {
                                                console.log(response);
                                            } else {
                                                scope.passwordErrorMessage = response.error;
                                                console.log(response);
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.verifyErrorMessage = response.error;
                                        });
                                };

                                $scope.activation_reset = function () {
                                    $scope.popupVerifyLoading = true;

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                        "&action=angular_proxy" +
                                        "&type=account_activation_reset",
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupVerifyLoading = false;

                                            if (response.success) {
                                                //config.ACCOUNT_EMAIL = null;
                                                //config.HAS_KEY = false;
                                                //config.HAS_KEY_VERIFIED = false;
                                                //config.HAS_EMAIL_VERIFICATION_REQUEST = false;
                                                //config.HAS_PASSWORD

                                                $modalInstance.close();
                                                $state.transitionTo('activate', null, {reload: true});
                                            } else {
                                                $scope.verifyErrorMessage = response.error;
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.popupVerifyLoading = true;
                                            $scope.verifyErrorMessage = response.error;
                                        });
                                };
                            }],
                        windowClass: 'w400px',
                        backdrop: 'static',
                        resolve: {
                            resource: function () { return $scope.resource; }
                        }
                    });
                }]
            })*/
            .state('verify', {
                templateUrl: config.BASE_PATH + 'templates/activate/blury.html',
                url: '/verify',
                controller: ["$scope", "$http", "$state", "$modal", "config", "$stateParams", "$rootScope", function($scope, $http, $state, $modal, config, $stateParams, $rootScope) {
                    if (config.HAS_KEY_VERIFIED) {
                        $state.transitionTo('dashboard', null, {reload: true});
                        return;
                    }
                    if (config.HAS_EMAIL_VERIFICATION_REQUEST) {
                        $state.transitionTo('verify:email_not_verified', null, {reload: true});
                        return;
                    }
                    if (!config.ACCOUNT_EMAIL) {
                        $state.transitionTo('verify:email_not_verified', null, {reload: true});
                        return;
                    }

                    $scope.config = config;

                    $scope.resource = {email: config.ACCOUNT_EMAIL, verify_by: "password"};

                    $modal.open({
                        templateUrl: config.BASE_PATH + 'templates/activate/popup_verify.html',
                        controller: ['$scope', '$modalInstance', 'domainService', 'config', 'resource',
                            function ($scope, $modalInstance, domainService, config, resource) {

                                $scope.config = config;
                                $scope.resource = resource;
                                $scope.verifyErrorMessage = null;
                                $scope.popupVerifyLoading = false;

                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };

                                $scope.verify = function (form) {
                                    $scope.popupVerifyLoading = true;

                                    $scope.verify_by_email_success = function() {
                                        $modal.open({
                                            templateUrl: config.BASE_PATH + 'templates/activate/popup_email_sent.html',
                                            controller: function() {},
                                            windowClass: 'w400px',
                                            backdrop: 'static'
                                        });
                                    }

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                            "&action=angular_proxy" +
                                            "&type=account_verify" +
                                            "&Email=" + encodeURIComponent($scope.resource.email) +
                                            "&Password=" + encodeURIComponent($scope.resource.password) +
                                            "&VerifyBy=" + $scope.resource.verify_by,
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupVerifyLoading = false;

                                            if (response.success) {
                                                config.HAS_KEY_VERIFIED = response.key_verified;
                                                $modalInstance.close();
                                                if ($scope.resource.verify_by == 'password') {
                                                    $state.transitionTo('dashboard', null, {reload: true});
                                                } else {
                                                    $scope.verify_by_email_success();
                                                }
                                            } else {
                                                if (response.code == 'password_wrong') {
                                                    $scope.verifyErrorMessage = null;
                                                    form['password'].$setDirty && form['password'].$setDirty(true);
                                                    form['password'].$setValidity(response.code, false);
                                                } else {
                                                    $scope.popupVerifyLoading = false;
                                                    $scope.verifyErrorMessage = response.error;
                                                }

                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.verifyErrorMessage = response.error;
                                        });
                                };

                                $scope.activation_reset = function () {
                                    $scope.popupVerifyLoading = true;

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                            "&action=angular_proxy" +
                                            "&type=account_activation_reset",
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupVerifyLoading = false;

                                            if (response.success) {
                                                config.ACCOUNT_EMAIL = null;
                                                config.HAS_KEY = false;
                                                config.HAS_KEY_VERIFIED = false;
                                                config.HAS_EMAIL_VERIFICATION_REQUEST = false;
                                                config.HAS_PASSWORD = true;

                                                $modalInstance.close();
                                                $state.transitionTo('activate', null, {reload: true});
                                            } else {
                                                $scope.verifyErrorMessage = response.error;
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.popupVerifyLoading = true;
                                            $scope.verifyErrorMessage = response.error;
                                        });
                                };
                            }],
                        windowClass: 'w400px',
                        backdrop: 'static',
                        resolve: {
                            resource: function () { return $scope.resource; }
                        }
                    });
                }]
            })
            .state('verify:email_not_verified', {
                templateUrl: config.BASE_PATH + 'templates/activate/blury.html',
                url: '/email_not_verified',
                controller: ["$scope", "$http", "$state", "$modal", "config", "$stateParams", "$rootScope", function($scope, $http, $state, $modal, config, $stateParams, $rootScope) {
                    if (config.HAS_KEY_VERIFIED) {
                        $state.transitionTo('dashboard', null, {reload: true});
                        return;
                    }
                    if (config.HAS_KEY && !config.HAS_EMAIL_VERIFICATION_REQUEST) {
                        $state.transitionTo('verify', null, {reload: true});
                        return;
                    }
                    if (!config.ACCOUNT_EMAIL) {
                        $state.transitionTo('activate', null, {reload: true});
                        return;
                    }

                    $scope.config = config;

                    $modal.open({
                        templateUrl: config.BASE_PATH + 'templates/activate/popup_email_not_verified.html',
                        controller: ['$scope', '$modalInstance', 'domainService', 'config', 'resource',
                            function ($scope, $modalInstance, domainService, config, resource) {

                                $scope.config = config;
                                $scope.account_email = config.ACCOUNT_EMAIL;
                                $scope.popupResendLoading = false;
                                $scope.popupActivateLoading = false;
                                $scope.popupMainLoading = true;
                                $scope.verifyErrorMessage = null;

                                $http.post(my_ajax_obj.ajax_url,
                                    "_ajax_nonce="  + my_ajax_obj.nonce + "&action=angular_proxy&type=account_key_is_verified",
                                    {headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }}
                                ).
                                    success(function(response) {
                                        if (response.success) {
                                            if (response.key_verified) {
                                                config.HAS_KEY_VERIFIED = true;
                                                $modalInstance.close();
                                                $state.transitionTo('dashboard', null, {reload: true});
                                            }
                                        } else {
                                            $scope.verifyErrorMessage = response.error;
                                        }
                                        $scope.popupMainLoading = false;
                                    });

                                $scope.resend = function (form) {
                                    $scope.popupResendLoading = true;

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                            "&action=angular_proxy" +
                                            "&type=account_resend_verification_link",
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupResendLoading = false;

                                            if (response.success) {
                                                $modalInstance.close();
                                                $scope.verify_by_email_success();

                                            } else {
                                                $scope.verifyErrorMessage = response.error;
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.popupVerifyLoading = true;
                                            $scope.verifyErrorMessage = response.error;
                                        });
                                };

                                $scope.activation_reset = function () {
                                    $scope.popupActivateLoading = true;

                                    $http.post(my_ajax_obj.ajax_url,
                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                            "&action=angular_proxy" +
                                            "&type=account_activation_reset",
                                        {headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }}
                                    ).
                                        success(function(response) {
                                            $scope.popupActivateLoading = false;

                                            if (response.success) {
                                                config.ACCOUNT_EMAIL = null;
                                                config.HAS_KEY = false;
                                                config.HAS_KEY_VERIFIED = false;
                                                config.HAS_EMAIL_VERIFICATION_REQUEST = false;
                                                config.HAS_PASSWORD = true;

                                                $modalInstance.close();
                                                $state.transitionTo('activate', null, {reload: true});
                                            } else {
                                                $scope.verifyErrorMessage = response.error;
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            $scope.popupVerifyLoading = true;
                                            $scope.verifyErrorMessage = response.error;
                                        });
                                };

                                $scope.verify_by_email_success = function() {
                                    $modal.open({
                                        templateUrl: config.BASE_PATH + 'templates/activate/popup_email_sent.html',
                                        controller: function() {},
                                        windowClass: 'w400px',
                                        backdrop: 'static'
                                    });
                                }
                            }],
                        windowClass: 'w400px',
                        backdrop: 'static',
                        resolve: {
                            resource: function () { return $scope.resource; }
                        }
                    });
                }]
            })
            .state('dashboard', {
                templateUrl: config.BASE_PATH + 'templates/dashboard.html',
                url: '/dashboard',
                controller: ["$scope", "$timeout", "$rootScope", "$state", "$http", "$sce", '$filter', '$modal', "accountService", "domainService", "competitorService", "keywordService", "autoReportService", "usersService", "shareService", "groupSearchFactory", "config", function($scope, $timeout, $rootScope, $state, $http, $sce, $filter, $modal, accountService, domainService, competitorService, keywordService, autoReportService, usersService, shareService, groupSearchFactory,  config) {
                    if (!config.HAS_KEY) {
                        $state.transitionTo('activate', null, {reload: true});
                        return;
                    }
                    if (!config.HAS_KEY_VERIFIED) {
                        $state.transitionTo('verify', null, {reload: true});
                        return;
                    }

                    $scope.config = config;

                    // Default hardcode
                    $scope.dict = {"ASC":"Ascending","CHANGE_ONE_MONTH":"Trend 1 month","CHANGE_ONE_WEEK":"Trend 1 week","CHANGE_SIX_MONTHS":"Trend 6 months","CHANGE_THREE_MONTHS":"Trend 3 months","CREATED_DATE":"Created","CUSTOM":"Custom","DESC":"Descending","DOMAIN_NAME":"Domain name","keywordfilter_0":"None","keywordfilter_1":"Groups","keywordfilter_2":"Keywords","LAST_MONTH":"Last month","LAST_WEEK":"Last week","LAST_YEAR":"Last year","NUM_COMPETITORS":"Competitors","NUM_KEYWORDS":"Keywords","ONE_MONTH":"One month","ONE_WEEK":"One week","ONE_YEAR":"One year","p_account_close_h1":"Close account","p_account_overview_h1":"Overview","p_account_payment_h1":"Payment","p_account_profile_h1":"Profile","p_account_transactions_h1":"Transactions","p_account_users_h1":"Users","p_alerts_h1":"Alerts","p_competitors_h1":"Competitors","p_keywords_h1":"Keywords","p_keywords_p":"You can add as many keywords as you want! You are currently tracking a total of {0} keywords for your domains. Add more keywords to track by adding them below. More than {1} keywords is {2} euro per keyword per month.","p_keywords_p_free":"You can only add {0} keyword for your Free account. Please upgrade to Account to add and track more keywords.","p_keywords_p_trial":"You can add {0} different keywords for your Trial account.  You are currently tracking a total of {1} keywords for your domain. Add more keywords to track by adding them below.","p_keywords_popup_p":"By adding extra keyword you also confirming that {0} will be added to your invoice.","p_myaccount_h1":"My account","p_mydomains_h1":"My domains","p_ranking_h1":"Ranking","p_renewaccount_h1":"Your 30 day trial account has expired!","p_support_h1":"Support","SEARCH_LOCATION":"Search location","SIX_MONTHS":"Six months","THREE_MONTHS":"Three months","topmenu_addremove_domains":"Add/remove domains","topmenu_admin":"Admin","topmenu_logout":"Sign out","topmenu_myaccount":"My account","topmenu_mydomains":"My domains","topmenu_rankings":"Rankings","TWO_MONTHS":"Two months","TWO_WEEKS":"Two weeks","TWO_YEARS":"Two years","x_2nd_best":"2nd best","x_active":"Active","x_add":"Add","x_add_domain":"add domain","x_add_keyword":"Add keyword","x_added":"Added","x_all":"All","x_amount":"Amount","x_best":"best","x_card_holder":"Card holder","x_category":"category","x_change":"change","x_change_card":"Change card","x_competitor":"Competitors","x_competitors":"Competitors","x_credit_card_information":"Credit card information","x_csv":"CSV","x_current_plan":"Current plan","x_date":"Date","x_description":"Description","x_domain_name":"Domain name","x_domain_to_monitor":"Domain to monitor","x_expiry_date":"Expiry date","x_extra_keywords":"Extra keywords","x_keyword":"keyword","x_keywords":"Keywords","x_last_week_position_summary":"Last week position summary","x_manage_domains":"manage domains","x_manage_keyword_for":"Manage keywords for","x_message":"message","x_my_account":"my account","x_name":"Name","x_on":"on","x_on_all_keywords":"on all keywords","x_pdf":"PDF","x_position":"position","x_rank_last_updated":"rank last updated","x_rankings":"rankings","x_recent_ranking_success":"recent ranking success","x_search_location":"search location","x_select":"select","x_select_date_range":"select date range","x_select_keyword":"select keyword","x_send_graph":"Send graph","x_start_price":"Start price","x_support_category":"Support category","x_total":"Total","x_total_current_plan":"Total current plan","x_trial_account":"Trial account","x_view_all":"view all","x_worst":"worst","x_zoom_chart":"Zoom chart"};

                    domainService.getDictionary(function(response) {
                        if (response.success) {
                            $scope.dict = response.data
                        }
                    });

                    $scope.basepath = config.BASE_PATH;

                    $scope.loading = true;
                    $scope.editGroupsMode = false;
                    $scope.chartLoading = true;
                    $scope.addingKeywordLoading = false;
                    $scope.addCompetitorLoading = false;
                    $scope.accountUpgradeErrorMessage = null;

                    $scope.keywordForm = {};

                    $scope.Domain = {};
                    $scope.Domain.Request = {};
                    $scope.Domain.SelectedAccountDomainKeywordId = null;
                    $scope.Domain.SelectedGraphInterval = "ONE_MONTH";
                    $scope.Domain.Request.GraphInterval = 3;
                    $scope.Domain.Request.ResultsPerPage = null;
                    $scope.Domain.Request.Height = 400;

                    $scope.Domain.Request.Page = 1;
                    $scope.Domain.Request.GraphHeight = 0; // auto

                    $scope.bigCurrentPage = 1;

                    $scope.FbLikeUrl = "https://www.facebook.com/pages/Wincher/255139058015479?fref=ts";

                    accountService.getAccount(function (response) {
                        if (response.success) {
                            if (response.account_closed) {
                                $scope.isAccountError = true;
                                $scope.accountError = response.account_closed;
                                $scope.loading = false;
                            } else {
                                $scope.widget = {
                                    AccountId: response.data.AccountId ? response.data.AccountId : null,
                                    AccountType: response.data.AccountType ? response.data.AccountType : null,
                                    ShowPaymentFailure: response.data.ShowPaymentFailure ? response.data.ShowPaymentFailure : null,
                                    AccountTransactionsUrl: response.data.AccountTransactionsUrl ? response.data.AccountTransactionsUrl : null,
                                    AccountUpgradeUrl: response.data.AccountUpgradeUrl ? response.data.AccountUpgradeUrl : null
                                }

                                config.ACCOUNT_DATA = response.data;

                                domainService.getDomainId(function(response) {
                                    if (response.success) {
                                        if (response.data.Id) {
                                            $rootScope.userDomainId = response.data.Id;
                                            $scope.Domain.Request.AccountDomainId = parseInt($rootScope.userDomainId);
                                        }

                                        $scope.reload(true, 1);
                                    } else {
                                        $scope.isAccountError = true;
                                        $scope.accountError = response.error;
                                        $scope.loading = false;
                                    }
                                });
                            }
                        } else {
                            $scope.isAccountError = true;
                            $scope.accountError = !response.error ? 'Some error occured. Please reload the page and contact administrator if error is still there.' : response.error;
                            $scope.loading = false;
                        }
                    });

                    $scope.reload = function(rankingCheck, page, resultsPerPage) {

                        $scope.pageLoading = true;
                        $scope.Domain.Request.Page = page;

                        if (resultsPerPage) {
                            $scope.Domain.Request.ResultsPerPage = resultsPerPage;
                            $scope.Domain.Request.Page = 1;
                        }

                        domainService.getUserDomain($scope.Domain.Request, function (response) {
                            if (response.success) {
                                var domain = response.data;

                                $scope.selectedDomainName = domain.DomainNameUnicode;

                                $scope.Domain = domain;

                                $scope.loading = false;
                                $scope.pageLoading = false;

                                $scope.Domain.Request.Height = 400;
                                $scope.Domain.Request.ResultsPerPage = domain.ResultsPerPage;

                                $scope.reloadChart();

                                if (page == 1) {
                                    $scope.getRankingSuccesses();
                                    $scope.getRankingTrend();

                                    if (!$scope.filterOptions) {
                                        $scope.getFilterOptions();
                                    }
                                }

                                if ($scope.filterOptions && $scope.Domain.Request.Filter) {
                                    $scope.Domain.Request.Filter = window._.find($scope.filterOptions, function (o) {
                                        return o.Value == $scope.Domain.Request.Filter.Value && o.Type == $scope.Domain.Request.Filter.Type;
                                    });
                                }

                                if (rankingCheck == true) {

                                    $scope.notTracked = window._.filter($scope.Domain.Keywords, function (item) { return item.Rank && item.Rank.Spinner; });

                                    $scope.total = $scope.notTracked.length;
                                    $scope.currentIndex = 0;

                                    var callback = function() {

                                        if ($scope.notTracked.length < 20) {
                                            $scope.reload(false, 1);
                                        }

                                        $scope.currentIndex = $scope.currentIndex + 1;

                                        if ($scope.currentIndex < $scope.total && $scope.notTracked[$scope.currentIndex].UserDomainKeywordId) {
                                            keywordService.track($scope.notTracked[$scope.currentIndex].UserDomainKeywordId, callback);
                                        }
                                    }

                                    if ($scope.notTracked.length > 0) {
                                        keywordService.track($scope.notTracked[$scope.currentIndex].UserDomainKeywordId, callback);
                                    }
                                }

                                if ($scope.Domain.InitialPopupShown == false) {

                                    $modal.open({
                                        templateUrl: config.BASE_PATH + 'templates/Panel/Popups/initialInformation.html',
                                        controller: 'InitialPopupCtrl',
                                        opened: $scope.$parent.wrapperFooterClass = "hide-if-mobile",
                                        resolve: {
                                            dailyRankingsToDate: function () { return $scope.Domain.DailyRankingsToDate; },
                                            upgrade_now_function: function () { return $scope.upgrade_now }
                                        }
                                    });
                                }

                                if ($scope.Domain.FacebookPopupShown == false) {

                                    $modal.open({
                                        templateUrl: config.BASE_PATH + 'templates/Panel/Popups/facebook.html',
                                        controller: 'FacebookPopupCtrl',
                                        opened: $scope.$parent.wrapperFooterClass = "hide-if-mobile",
                                        resolve: {}
                                    });
                                }
                            }
                        });
                    };

                    $scope.upgrade_now = function () {
                        accountService.getAccountUser(function (response) {
                            if (response.success) {
                                if (response.data.HasPassword) {
                                    window.open(response.data.UpgradeUrl, '_blank');
                                    return;
                                } else {
                                    $modal.open({
                                        templateUrl: config.BASE_PATH + 'templates/activate/popup_password.html',
                                        controller: ['$scope', '$modalInstance', 'domainService', 'config', 'resource',
                                            function ($scope, $modalInstance, domainService, config, resource) {

                                                $scope.config = config;
                                                $scope.resource = resource;
                                                $scope.passwordErrorMessage = null;
                                                $scope.popupPasswordLoading = false;

                                                $scope.resource = {"password":null, password_confirm:null};

                                                $scope.cancel = function () {
                                                    $modalInstance.dismiss('cancel');
                                                };

                                                $scope.confirm = function (form) {
                                                    $scope.popupPasswordLoading = true;

                                                    $scope.password_sent = function() {
                                                        accountService.getAccountUser(function (response) {
                                                            if (response.success) {
                                                                if (response.data.UpgradeUrl) {
                                                                    $modalInstance.dismiss('cancel');
                                                                    window.open(response.data.UpgradeUrl, '_blank');
                                                                } else {
                                                                    $scope.passwordErrorMessage = 'Error getting redirect URL. Please reload the page and try again.';
                                                                }
                                                            } else {
                                                                $scope.passwordErrorMessage = response.error;
                                                            }
                                                        });
                                                    }

                                                    $http.post(my_ajax_obj.ajax_url,
                                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                                            "&action=angular_proxy" +
                                                            "&type=account_password" +
                                                            "&Password=" + encodeURIComponent($scope.resource.password),
                                                        {headers: {
                                                            'Content-Type': 'application/x-www-form-urlencoded'
                                                        }}
                                                    ).
                                                        success(function(response) {
                                                            $scope.popupPasswordLoading = false;

                                                            if (response.success) {
                                                                $scope.password_sent();
                                                                return;
                                                            } else {
                                                                $scope.passwordErrorMessage = response.error;
                                                            }
                                                        }).
                                                        error(function(data, status, headers, config) {
                                                            $scope.passwordErrorMessage = response.error;
                                                        });
                                                };

                                                $scope.activation_reset = function () {
                                                    $scope.popupVerifyLoading = true;

                                                    $http.post(my_ajax_obj.ajax_url,
                                                        "_ajax_nonce="  + my_ajax_obj.nonce +
                                                            "&action=angular_proxy" +
                                                            "&type=account_activation_reset",
                                                        {headers: {
                                                            'Content-Type': 'application/x-www-form-urlencoded'
                                                        }}
                                                    ).
                                                        success(function(response) {
                                                            $scope.popupVerifyLoading = false;

                                                            if (response.success) {
                                                                //config.ACCOUNT_EMAIL = null;
                                                                //config.HAS_KEY = false;
                                                                //config.HAS_KEY_VERIFIED = false;
                                                                //config.HAS_EMAIL_VERIFICATION_REQUEST = false;
                                                                //config.HAS_PASSWORD

                                                                $modalInstance.close();
                                                                $state.transitionTo('activate', null, {reload: true});
                                                            } else {
                                                                $scope.verifyErrorMessage = response.error;
                                                            }
                                                        }).
                                                        error(function(data, status, headers, config) {
                                                            $scope.popupVerifyLoading = true;
                                                            $scope.verifyErrorMessage = response.error;
                                                        });
                                                };
                                            }],
                                        windowClass: 'w400px',
                                        backdrop: 'static',
                                        resolve: {
                                            resource: function () { return $scope.resource; }
                                        }
                                    });
                                }
                            } else {
                                $scope.accountUpgradeErrorMessage = response.error;
                            }
                        });
                    };

                    $scope.refreshPageGraph = function () {
                        $scope.Domain.Request.IncludeCompetitors = true;
                        $scope.reload(false, $scope.Domain.Request.Page);
                    };

                    $scope.flipOrderAndReload = function (orderBy) {

                        if ($scope.Domain.Request.OrderBy == orderBy.Value) {
                            if ($scope.Domain.Request.SortBy == 1) {
                                $scope.Domain.Request.SortBy = 2;
                            } else {
                                $scope.Domain.Request.SortBy = 1;
                            }
                        }
                        $scope.Domain.Request.OrderBy = orderBy.Value;
                        $scope.reload(false, $scope.Domain.Request.Page);
                    };

                    $scope.selectAllKeywords = function () {

                        for (var i = 0; i < $scope.Domain.Keywords.length; i++) {
                            if ($scope.selectedAllChecked) {
                                $scope.Domain.Keywords[i].Selected = false;
                            } else {
                                $scope.Domain.Keywords[i].Selected = true;
                            }
                        }

                        $scope.selectedAllChecked = !$scope.selectedAllChecked;
                    };

                    $scope.addGroup = function (keyword) {

                        keywordService.addGroupToKeyword(keyword.UserDomainKeywordId, keyword.newGroup).then(
                            function () {
                                $scope.getFilterOptions();
                                $scope.reload(false, $scope.currentPage);

                            }, function (data) {
                                $scope.errorMessage = data.Message;
                                $scope.loading = false;
                            }
                        );
                    };

                    $scope.removeGroup = function (accountDomainKeywordId, groupId) {

                        keywordService.removeKeywordFromGroup(accountDomainKeywordId, groupId).then(
                            function (response) {
                                $scope.getFilterOptions();
                                $scope.reload(false, $scope.currentPage);

                                if (response.data) {

                                    //console.log(response.data);

                                    //$scope.groupSuccessMessage = angular.fromJson(response.data);
                                    //$scope.groupErrorMessage = null;
                                }

                            }, function (data) {
                                $scope.groupErrorMessage = data.Message;
                                $scope.groupSuccessMessage = null;

                                $scope.loading = false;
                            }
                        );
                    };

                    $scope.reloadKeywordChart = function () {

                        $scope.Domain.Request.IncludeCompetitors = true;

                        domainService.getKeywordChartRaw($scope.Domain.Request, function (response) {
                            for (var i = 0; i < response.data.graphs; i++) {
                                response.data.graphs[i] = $sce.trustAsHtml(response.data.graphs[i]);
                            }

                            $scope.amgraphs = response.data.graphs;
                            $scope.amdata = response.data.data;
                            $scope.chartLoading = false;
                        });
                    };

                    $scope.reloadChart = function() {
                        domainService.getChartRaw($scope.Domain.Request, function (response) {
                            if (response.success) {
                                for (var i = 0; i < response.data.graphs; i++) {
                                    response.data.graphs[i] = $sce.trustAsHtml(response.data.graphs[i]);
                                }

                                $scope.amgraphs = response.data.graphs;
                                $scope.amdata = response.data.data;
                                $scope.chartLoading = false;
                            }
                        })
                    }

                    $scope.getRankingSuccesses = function() {
                        domainService.getRankingSuccesses($scope.Domain.Request.AccountDomainId, 6, function (response) {
                            if (response.success) {
                                $scope.LatestSuccesses = response.data;
                                for (var i = 0; i < $scope.LatestSuccesses.length; i++) {
                                    $scope.LatestSuccesses[i].Text = $sce.trustAsHtml($scope.LatestSuccesses[i].Text);
                                    $scope.LatestSuccesses[i].Url = 'http://www.facebook.com/sharer.php?u=https://www.wincher.com/share/'+ $scope.LatestSuccesses[i].Id + '/' + encodeURIComponent(config.DOMAIN_NAME);
                                }
                            }
                        })
                    };

                    $scope.getRankingTrend = function () {
                        domainService.getRankingTrend($scope.Domain.Request.AccountDomainId, $scope.Domain.Request.GraphInterval, function (response) {
                            $scope.Trend = response.data
                        });
                    };

                    $scope.twitterShare = function (successId) {
                        shareService.shareSuccessTwitter(successId, function(response) {
                            if (response.success) {
                                var win = window.open(response.data.RedirectUri, '_blank', "width=600, height=210");
                                win.focus();
                            } else {
                                alert(response.error);
                            }
                        });
                    };

                    $scope.facebookShare = function (successId) {
                        shareService.shareSuccessFacebook(successId, function(response) {
                            if (response.success) {
                                var win = window.open('https://www.facebook.com/sharer/sharer.php?u=' + response.data.RedirectUri, '_blank', "width=600, height=331");
                                win.focus();
                            } else {
                                alert(response.error);
                            }
                        });
                    };

                    $scope.emailSharePopup = function (successId) {

                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/emailShare.html',
                            controller: 'EmailShareCtrl',
                            resolve: { successId: function () { return successId; } }
                        });
                    };

                    $scope.sendGraphPopup = function () {
                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/sendGraph.html',
                            controller: 'SendGraphCtrl',
                            resolve: {
                                accountDomainId: function () { return $scope.Domain.Request.AccountDomainId; },
                                interval: function () { return $scope.Domain.Request.GraphInterval; }
                            }
                        });
                    };

                    $scope.getFilterOptions = function () {
                        keywordService.getKeywordFilterList($scope.Domain.Request.AccountDomainId).then(function (response) {
                            if (response.data.success) {
                                $scope.filterOptions = response.data.data;
                            }
                        }, function (data) {
                            console.log(data);
                        });
                    };


                    $scope.trendClass = function (value) {

                        if (value < 0) {
                            return 'wi-down';
                        } else if (value > 0) {
                            return 'wi-up';
                        } else if (value == 0) {
                            return 'wi-right';
                        }

                        return '';
                    };

                    $scope.trendSign = function (value) {

                        if (value < 0) {
                            return '-';
                        } else if (value > 0) {
                            return '+';
                        } else if (value == 0) {
                            return '';
                        }

                        return '';
                    };

                    $scope.hideMessages = function () {

                        $scope.keywordErrorMessage = null;
                        $scope.keywordSuccessMessage = null;
                        $scope.competitorErrorMessage = null;
                        $scope.competitorSuccessMessage = null;
                    };

                    $scope.addCompetitor = function () {

                        if ($scope.addCompetitorLoading == false) {

                            $scope.addCompetitorLoading = true;
                            var newCompetitor = {};
                            newCompetitor.DomainName = $scope.Domain.newCompetitorDomainName;
                            newCompetitor.UserDomainId = $rootScope.userDomainId;
                            newCompetitor.Id = -1;

                            competitorService.addCompetitor(newCompetitor).then(
                                function (response) {

                                    $scope.addCompetitorLoading = false;
                                    $scope.Domain.newCompetitorDomainName = "";
                                    $scope.hideMessages();

                                    if (response.data.success) {
                                        var competitor = response.data.data;
                                        $scope.Domain.Competitors.push(competitor);
                                        $scope.competitorSuccessMessage = "Competitor [" + competitor.DomainName + "] added successfully";
                                    } else {
                                        $scope.competitorErrorMessage = response.data.error;
                                    }
                                }, function (data) {
                                    $scope.addCompetitorLoading = false;
                                    $scope.hideMessages();
                                    $scope.competitorErrorMessage = data.Message;
                                });
                        }
                    };

                    $scope.deleteCompetitor = function (competitorIndex) {

                        var competitor = $scope.Domain.Competitors[competitorIndex];

                        var modalInstance = $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/removeCompetitor.html',
                            controller: 'DeleteCompetitorPopupCtrl',
                            resolve: {
                                competitor: function () { return competitor; }
                            }
                        });

                        modalInstance.result.then(function () {
                            $scope.Domain.Competitors.splice(competitorIndex, 1);
                            $scope.hideMessages();
                            $scope.competitorSuccessMessage = "Competitor [" + competitor.DomainName + "] deleted successfully";

                        }, function () {
                            $scope.hideMessages();

                        });
                    };

                    $scope.createKeyword = function () {

                        var keywords = $scope.keywordForm.newKeyword;

                        var groups = $scope.keywordForm.newGroup;

                        if ($scope.Domain.KeywordAddingDisabled) {
                            $modal.open({
                                templateUrl: config.BASE_PATH + 'templates/Panel/Popups/addKeywordAccountLimited.html',
                                controller: 'CreateKeywordAccountLimitedPopupCtrl',
                                resolve: {
                                    dict: function () { return $scope.dict; }
                                }
                            });
                        } else {

                            if ($scope.addingKeywordLoading == false && keywords && !$scope.keywordForm.currentGroupIndex) {

                                $scope.addingKeywordLoading = true;

                                keywordService.createKeyword($rootScope.userDomainId, keywords, groups).then(function (response) {

                                    $scope.keywordForm.newKeyword = "";
                                    $scope.matchingGroups = [];
                                    $scope.keywordForm.newGroup = null;

                                    $scope.Domain.Request.OrderBy = $scope.Domain.OrderByOptions[5].Value;
                                    $scope.Domain.Request.SortBy = 1;

                                    $scope.reload(true, $scope.Domain.Request.Page);
                                    $scope.hideMessages();
                                    $scope.keywordSuccessMessage = response.data.Message;
                                    $scope.addingKeywordLoading = false;
                                    $scope.newKeyword = "";

                                }, function (data) {

                                    scope.keywordForm.newKeyword = "";
                                    $scope.hideMessages();
                                    $scope.keywordErrorMessage = response.data.Message;
                                    $scope.addingKeywordLoading = false;
                                });
                            }

                            if ($scope.keywordForm.currentGroupIndex) {
                                alert("Locked = $scope.keywordForm.currentGroupIndex = " + $scope.keywordForm.currentGroupIndex);
                            }
                        }
                    };

                    $scope.getSelectedKeywordIds = function () {

                        var selectedKeywords = window._.filter($scope.Domain.Keywords, function (k) { return k.Selected; });
                        var keywordIds = [];

                        for (var i = 0; i < selectedKeywords.length; i++) {
                            keywordIds.push(selectedKeywords[i].UserDomainKeywordId);
                        }

                        return keywordIds;
                    };

                    $scope.bulkDeleteKeywords = function () {

                        var keywordIds = $scope.getSelectedKeywordIds();

                        if (keywordIds.length > 0) {

                            var modalInstance = $modal.open({
                                opened: $scope.$parent.wrapperFooterClass = "hide-if-mobile",
                                templateUrl: config.BASE_PATH + 'templates/Panel/Popups/removeKeyword.html',
                                controller: 'BulkDeleteKeywordsPopupCtrl',
                                resolve: {
                                    ids: function () { return keywordIds; },
                                    config: function () { return config; }
                                }
                            });

                            modalInstance.result.then(function () {

                                $scope.$parent.wrapperFooterClass = false;
                                $scope.reload(false, $scope.currentPage);
                                $scope.hideMessages();
                                $scope.keywordSuccessMessage = keywordIds.length + " keyword(s) has been deleted";
                                $scope.addingKeywordLoading = false;
                                $scope.Domain.selectedbulkAction = "";

                                $scope.Domain.selectedAllChecked = false;

                            }, function () {
                                $scope.$parent.wrapperFooterClass = false;
                                $scope.hideMessages();
                                $scope.addingKeywordLoading = false;
                                $scope.Domain.selectedbulkAction = "";

                            });
                        } else {
                            $scope.hideMessages();
                            $scope.keywordErrorMessage = "No keywords selected.";
                            $scope.Domain.selectedbulkAction = "";
                        }
                    };

                    $scope.bulkInsert = function () {

                        var modalInstance = $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/addKeywordBulk.html',
                            controller: 'CreateKeywordBulkPopupCtrl',
                            resolve: {
                                dict: function () { return $scope.dict; },
                                userDomainId: function () { return $rootScope.userDomainId; }
                            }
                        });

                        modalInstance.result.then(function (model) {

                            $scope.Domain.Request.OrderBy = $scope.Domain.OrderByOptions[5].Value;
                            $scope.Domain.Request.SortBy = 1;

                            $scope.reload(true, $scope.currentPage);

                            $scope.hideMessages();
                            $scope.keywordSuccessMessage = "Keywords created successfully";
                            $scope.addingKeywordLoading = false;

                        }, function () {
                            $scope.hideMessages();
                        });
                    };

                    $scope.rankingSuccessesPopup = function () {
                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/rankingSuccesses.html',
                            controller: 'RankingSuccessesCtrl',
                            windowClass: 'w900px',
                            resolve: {
                                accountDomainId: function () { return $rootScope.userDomainId; },
                                emailSharePopup: function () { return $scope.emailSharePopup; },
                                twitterShare: function () { return $scope.twitterShare; },
                                facebookShare: function () { return $scope.facebookShare; }

                            }
                        });
                    };

                    $scope.serpPopup = function (accountDomainKeywordId) {
                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/serp.html',
                            controller: 'SerpPopupCtrl',
                            opened: true,
                            windowClass: 'w600px',
                            resolve: {
                                accountDomainKeywordId: function () { return accountDomainKeywordId; }
                            }
                        });
                    };

                    $scope.autoReportPopup = function () {

                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/autoReport.html',
                            controller: 'AutoReportPopupCtrl',
                            resolve: {
                                accountDomainId: function () { return $rootScope.userDomainId; },
                                dict: function () { return $scope.dict; }
                            }
                        });
                    };

                    $scope.pdfReportPopup = function () {

                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/pdfReport.html',
                            controller: 'PdfReportPopupCtrl',
                            opened: true,
                            resolve: {
                                request: function () { return $scope.Domain.Request; },
                                domainName: function () { return $scope.Domain.DomainName; },
                                dict: function () { return $scope.dict; }

                            }
                        });
                    };


                    $scope.keywordChartPopup = function (keywordName, showCompetitors) {
                        if (!showCompetitors)
                            showCompetitors = false;

                        keywordService.getKeywordId(keywordName, $rootScope.userDomainId, function (response) {

                            if (response.success) {
                                var accountDomainKeywordId = response.data;
                            } else {

                                $modal.open({
                                    templateUrl: config.BASE_PATH + 'templates/Panel/Popups/chartZoomError.html',
                                    controller: ['$scope', '$modalInstance', 'config', function($scope, $modalInstance, config) {
                                        $scope.config = config;
                                        $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
                                        $scope.message = response.error;
                                    }]
                                });
                                return;
                            }

                            $modal.open({

                                templateUrl: config.BASE_PATH + 'templates/Panel/Popups/chartZoom.html',
                                controller: 'KeywordChartZoomPopupCtrl',
                                opened: true,
                                windowClass: 'w1300px',
                                resolve: {
                                    selectedGraphInterval: function () { return $scope.Domain.Request.GraphInterval; },
                                    showCompetitors: function () { return showCompetitors; },
                                    filter: function () { return { Value: accountDomainKeywordId, Type: 2 }; }
                                }

                            });
                        });
                    };

                    $scope.keywordChartZoomPopup = function (keywordName) {
                        $scope.keywordChartPopup(keywordName, true);
                    };

                    $scope.domainChartZoomPopup = function () {

                        $modal.open({
                            templateUrl: config.BASE_PATH + 'templates/Panel/Popups/chartZoom.html',
                            controller: 'DomainChartZoomPopupCtrl',
                            opened: true,
                            windowClass: 'w1300px',
                            resolve: {
                                request: function () { return $scope.Domain.Request; }
                            }
                        });
                    };

                    $scope.downloadSimpleCSV = function () {
                        domainService.getSimpleCSV($rootScope.userDomainId, $scope.Domain.Request);
                    };

                    $scope.downloadCSV = function () {
                        domainService.getCSV($rootScope.userDomainId, $scope.Domain.Request);
                    };

                    /*$scope.downloadPDF = function () {

                        var rangeFrom = $filter('date')(angular.element("#rangeFrom").val(), 'yyyy-MM-dd');
                        var rangeTo = $filter('date')(angular.element("#rangeTo").val(), 'yyyy-MM-dd');

                        domainService.getPDF($rootScope.userDomainId, $scope.Domain.Request);
                    };*/
                }]
            })
        }])

    .run([
        '$rootScope', function ($rootScope) {
            $rootScope.facebookAppId = '534838143276126'; // set your facebook app id here
        }
    ])

    .directive('fbLike', [
        '$window', '$rootScope', function ($window, $rootScope) {
            return {
                restrict: 'A',
                scope: {
                    fbLike: '=?'
                },
                link: function (scope, element, attrs) {
                    if (!$window.FB) {
                        // Load Facebook SDK if not already loaded
                        $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
                            $window.FB.init({
                                appId: $rootScope.facebookAppId,
                                xfbml: true,
                                version: 'v2.3'
                            });
                            renderLikeButton();
                        });
                    } else {
                        renderLikeButton();
                    }

                    var watchAdded = false;
                    function renderLikeButton() {
                        if (!!attrs.fbLike && !scope.fbLike && !watchAdded) {
                            // wait for data if it hasn't loaded yet
                            var watchAdded = true;
                            var unbindWatch = scope.$watch('fbLike', function (newValue, oldValue) {
                                if (newValue) {
                                    renderLikeButton();

                                    // only need to run once
                                    unbindWatch();
                                }

                            });
                            return;
                        } else {
                            element.html('<div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="standard" data-action="like" data-width="340" data-show-faces="true" data-share="true"></div>');
                            $window.FB.XFBML.parse(element.parent()[0]);
                        }
                    }
                }
            };
        }])

    .directive('calendar', [function () {
        return {
            require: 'ngModel',
            link: function (scope, el) {
                jQuery(el).datepicker({});
            }
        };
    }])
    .directive('scrollTo', ['$location', '$anchorScroll', function ($location, $anchorScroll) {
        return function(scope, element, attrs) {
            element.bind('click', function(event) {
                event.stopPropagation();
                scope.$on('$locationChangeStart', function(ev) {
                    ev.preventDefault();
                });
                var location = attrs.scrollTo;
                $location.hash(location);
                $anchorScroll();
            });
        };
    }])

    .directive('focusMe', ['$timeout', function ($timeout) {
        return {
            scope: { trigger: '=focusMe' },
            link: function (scope, element) {
                scope.$watch('trigger', function (value) {
                    if (value === true) {
                        // console.log('trigger',value);
                        $timeout(function () {
                            element[0].focus();
                            scope.trigger = false;
                        });
                    }
                });
            }
        };
    }])


    .directive("groupSearch", ["config", function (config) {
        return {
            restrict: "AE",        // directive is an Element (not Attribute)
            scope: {              // set up directive's isolated scope
                accountDomainId: "=",
                groups: "=",
                ngModel: "=",
                autoSubmit: "=autoSubmit",
                placeholder: "@",
                submit: "&"
            },
            templateUrl: config.BASE_PATH + 'templates/Panel/Templates/groupSearch.html',
            replace: true,        // replace original markup with template
            transclude: true,    // do not copy original HTML content
            controller: ["$scope", "groupSearchFactory", function ($scope, groupSearchFactory) {

                groupSearchFactory.setKeywordGroups2($scope.groups);

                $scope.hideMatchingGroupsList = function () {
                    $scope.matchingGroups = [];
                };

                $scope.getCurrentGroupIndex = function () {
                    return groupSearchFactory.getSelectedGroupIndex();
                };

                $scope.setCurrentGroupIndex = function (index, autoSelect) {

                    groupSearchFactory.setSelectedGroupIndex(index, function (selectedGroupName) {
                        if (autoSelect === true) {
                            $scope.ngModel = selectedGroupName;
                            $scope.matchingGroups = [];
                            $scope.focusInput = true;
                        }
                    });
                };

                $scope.getMatchingGroups = function (q) {
                    $scope.matchingGroups = groupSearchFactory.getMatchingGroups(q);
                };

                $scope.selectGroup = function ($event) {

                    if ($event && $event.keyCode == 13 && $scope.matchingGroups.length == 0 && $scope.ngModel) {

                        if ($scope.autoSubmit === true) {
                            $scope.submit();
                        }
                    } else {

                        groupSearchFactory.getSelectedGroupIndex($event, function (selectedGroupName) {
                            $scope.ngModel = selectedGroupName;
                            $scope.matchingGroups = [];
                        });
                    };
                };
            }]
        };
    }])

    .directive("trendIcon", [function () {
        return {
            restrict: "E",        // directive is an Element (not Attribute)
            scope: {              // set up directive's isolated scope
                positions: "=",
                size: "@"
            },
            template:              // replacement HTML (can use our scope vars here)
                "<span class='{{hiddenClass}} icon-{{size}} {{iconClass}}-{{size}}'></span>",
            replace: true,        // replace original markup with template
            transclude: false,    // do not copy original HTML content
            controller: ["$scope", function ($scope) {

                if ($scope.positions === null) {
                    $scope.hiddenClass = "hidden";
                    $scope.iconClass = "none";

                } else {

                    var pos = parseInt($scope.positions);

                    if (pos < 0) {
                        $scope.iconClass = 'wi-down';
                    } else if (pos > 0) {
                        $scope.iconClass = 'wi-up';
                    } else if (pos == 0) {
                        $scope.iconClass = 'wi-right';
                    }
                }


            }],
            link: function (scope, element, attrs, controller) { }

        };
    }])

    .run(['$rootScope', '$location', '$anchorScroll', '$routeParams', '$timeout', function ($rootScope, $location, $anchorScroll, $routeParams, $timeout) {
        $rootScope.$on('$routeChangeSuccess', function (newRoute, oldRoute) {

            if ($routeParams.scrollTo) {

                $timeout(function () {
                    $location.hash($routeParams.scrollTo);
                    $anchorScroll();
                }, 500, false);
            }

        });
    }])

    .directive('amchart', ['$rootScope', '$window', '$timeout','config', function ($rootScope, $window, $timeout, config) {
        return {
            restrict: 'E',
            replace: false,
            template: function(el, scope) {
                return  '<div class="chartdiv" id="chartdiv' + scope.chartid + '" style="height: ' + (scope.high == "1" ? 600 : 400) + 'px"></div><div style="max-height:200px; overflow-y:auto; position:relative; overflow-x:hidden;"><div id="chartdivlegend' + scope.chartid + '"></div></div></div>';
            },
            scope: {
                amgraphs: '=',
                amdata: '=',
                high: '=',
                chartid: '=',
                amheight: '='
            },
            link: function (scope, el, attrs) {
                var timer, resize, chart1, chart2;
                scope.redraw = function() {
                    if (typeof scope.amdata == "undefined" || !scope.amdata) return;
                    var chart = window["chart" + scope.chartid];
                    if (chart && typeof chart.destroy == 'function') {
                        try {
                            chart.destroy();
                        } catch (err) {}
                    }

                    var amconfig = {
                        "type": "serial",
                        "pathToImages": config.BASE_PATH + 'images/amcharts/',
                        "categoryField": "date",
                        "dataDateFormat": "YYYY-MM-DD",
                        "categoryAxis": {
                            "parseDates": true
                        },
                        "chartCursor": {
                            "cursorColor": "#747474",
                            "graphBulletSize": 2,
                            "graphBulletAlpha": 1,
                            "oneBalloonOnly": true
                        },
                        creditsPosition: "bottom-right",
                        "trendLines": [],

                        "guides": [],
                        "valueAxes": [
                            {
                                "reversed": true,
                                "minimum": 0,
                                "maximim": scope.amheight ? scope.amheight : 100
                            }
                        ],
                        "colors": [
                            "#7cb5ec",
                            "#434348",
                            "#90ed7d",
                            "#f7a35c",
                            "#8085e9",
                            "#f15c80",
                            "#e4d354",
                            "#8085e8",
                            "#8d4653",
                            "#91e8e1"
                        ],
                        "allLabels": [],
                        "balloon": {
                            "fadeOutDuration": 0,
                            "showBullet": true,
                            "textAlign": "left"
                        },
                        "legend": {
                            "useGraphSettings": true,
                            "divId": "chartdivlegend" + scope.chartid
                        },
                        "titles": []
                    };

                    amconfig.graphs = angular.copy(scope.amgraphs);
                    amconfig.dataProvider = angular.copy(scope.amdata);

                    window["chart" + scope.chartid] = new AmCharts.makeChart("chartdiv" + scope.chartid, amconfig);

                    $rootScope.chartId++;
                };

                timer = void 0;
                resize = function() {
                    if (timer != null) {
                        $timeout.cancel(timer);
                    }
                    return timer = $timeout(scope.redraw, 200);
                };
                $window.addEventListener('resize', resize);
                scope.$watch('amdata', resize, true);
                scope.$watch('amgraphs', resize, true);

                //hardcode
                $timeout(scope.redraw, 1000);
                $timeout(scope.redraw, 5000);
            }
        };
    }])
    .filter('euro', ['$filter', function ($filter) {
        return function (text) {

            // var num = parseFloat(text);
            var num = $filter('number')(text, 2);
            return '€' +num ;
        };
    }]).

    filter('styleMatching', [function () {

        return function (text, q) {

            //text = text.insert(0, "<b>");
            //text = text.insert(q.length + 3, "</b>");

            return text;
        };
    }]).

    filter('newlineSplit',  [ function () {
        return function(text) {

            text = text.trim();

            return text.split('\n');
        };
    }]).

    filter('encode', [function () {
        return function (text) {

            text = text.replace(/%/g, '%25');
            text = text.replace(/#/g, '%23');
            text = text.replace(/&/g, '%26');
            text = text.replace(/'/g, '%27');
            text = text.replace(/\+/g, '%2B');
            text = text.replace(/\//g, '%2F');
            text = text.replace(/–/g, '%u2013');


            return text;
        };
    }]);

angular.module('app').controller('BulkDeleteKeywordsPopupCtrl', ['$scope', '$rootScope', '$modalInstance', 'ids', 'keywordService', 'config',
    function ($scope, $rootScope, $modalInstance, ids, keywordService, config) {

        $scope.config = config;

        $scope.popupLoading = false;
        $scope.ids = ids;

        $scope.ok = function () {
            $scope.popupLoading = true;
            keywordService.bulkDelete($scope.ids, function () {
                $modalInstance.close();
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $rootScope.$on('Error', function (event, msg) {
            console.log(msg);
            $modalInstance.dismiss('cancel');
        });

    }]);

angular.module('app').controller('InitialPopupCtrl', ['$scope', '$modalInstance', 'dailyRankingsToDate', '$window', 'upgrade_now_function',
    function ($scope, $modalInstance, dailyRankingsToDate, $window, upgrade_now_function) {

        $scope.dailyRankingsToDate = dailyRankingsToDate;

        $scope.ok = function () { $modalInstance.close(); };


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('Error', function (event, msg) {
            $scope.successMessage = null;
            $scope.errorMessage = msg;
            $scope.popupLoading = false;
        });

        $scope.upgrade_now = upgrade_now_function;
    }]);

angular.module('app').controller('FacebookPopupCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.FbLikeUrl = "https://www.facebook.com/pages/Wincher/255139058015479?fref=ts";

    $scope.ok = function () { $modalInstance.close(); };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('app').controller('EmailShareCtrl', ['$scope', '$modalInstance', 'shareService', 'usersService', 'successId', 'config',
    function ($scope, $modalInstance, shareService, usersService, successId, config) {

        $scope.config = config;

        $scope.popupLoading = false;
        usersService.getCurrentUserName(function (response) {
            $scope.form = {
                fromName: response.data,
                sendTo: ""
            };
        });

        $scope.send = function () {
            $scope.popupLoading = true;
            shareService.shareSuccessEmail($scope.form.sendTo, $scope.form.fromName, successId, function (response) {
                if (response.success) {
                    $scope.successMessage = "Ranking success sent.";
                    $scope.errorMessage = null;
                    $scope.form.sendTo = "";
                    $scope.popupLoading = false;
                } else {
                    $scope.successMessage = null;
                    $scope.errorMessage = response.error;
                    $scope.popupLoading = false;
                }
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('Error', function (event, msg) {
            $scope.successMessage = null;
            $scope.errorMessage = msg;
            $scope.popupLoading = false;
        });
    }]);


angular.module('app').controller('SendGraphCtrl', ['$scope', '$modalInstance', 'shareService', 'usersService', 'accountDomainId', 'interval', 'config',
    function ($scope, $modalInstance, shareService, usersService, accountDomainId, interval, config) {

        $scope.config = config;

        $scope.popupLoading = false;
        usersService.getCurrentUserName(function (response) {
            if (response.success && response.data.length) {
                $scope.form = {
                    fromName: response.data,
                    sendTo: ""
                };
            } else {
                $scope.form = {
                    fromName: config.USER_INFO.first ? config.USER_INFO.first + (config.USER_INFO.last ? " " + config.USER_INFO.last : "") : "",
                    sendTo: ""
                }
            }

        });

        $scope.send = function () {

            $scope.popupLoading = true;
            shareService.sendGraphEmail($scope.form.sendTo, $scope.form.fromName, accountDomainId, interval, function () {
                $scope.successMessage = "Email sent.";
                $scope.errorMessage = null;
                $scope.form.sendTo = "";
                $scope.popupLoading = false;
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.$on('Error', function (event, msg) {
            $scope.successMessage = null;
            $scope.errorMessage = msg;
            $scope.popupLoading = false;
        });

    }]);

angular.module('app').controller('DeleteCompetitorPopupCtrl', ['$scope', '$modalInstance', 'competitor', 'competitorService', 'config',
    function ($scope, $modalInstance, competitor, competitorService, config) {

        $scope.config = config;
        $scope.popupLoading = false;
        $scope.deleteDomainName = competitor.DomainName;

        $scope.ok = function () {

            $scope.popupLoading = true;
            competitorService.deleteCompetitor(competitor.Id, function () {
                $scope.popupLoading = false;
                $modalInstance.close();
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

angular.module('app').controller('RankingSuccessesCtrl', ['$scope', '$modal', '$modalInstance', '$sce', 'shareService', 'accountDomainId', 'domainService', 'emailSharePopup', 'twitterShare', 'facebookShare', 'config',
    function ($scope, $modal, $modalInstance, $sce, shareService, accountDomainId, domainService, emailSharePopup, twitterShare, facebookShare, config) {

        $scope.popupLoading = true;
        $scope.config = config;

        $scope.reload = function (page) {
            domainService.getRankingSuccessesPage(accountDomainId, page, function (response) {

                if (response.success) {

                    $scope.model = response.data;
                    $scope.model.resultsPerPage = 10;
                    $scope.model.TotalItems = $scope.model.TotalPages * 10;

                    for (var i = 0; i < $scope.model.Notifications.length; i++) {
                        $scope.model.Notifications[i].Text = $sce.trustAsHtml($scope.model.Notifications[i].Text);
                    }
                    $scope.popupLoading = false;
                }
            });
        };

        $scope.reload(1);
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.facebookShare = function (successId) {
            shareService.shareSuccessFacebook(successId);
        };

        $scope.twitterShare = function (successId) {
            shareService.shareSuccessTwitter(successId);
        };

        $scope.emailSharePopup = emailSharePopup;
        $scope.twitterShare = twitterShare;
        $scope.facebookShare = facebookShare;

    }]);

angular.module('app').controller('SerpPopupCtrl', ['$scope', '$modalInstance' ,'$anchorScroll', '$timeout', '$location', 'keywordService', 'accountDomainKeywordId', 'config',
    function ($scope, $modalInstance, $anchorScroll, $timeout, $location, keywordService, accountDomainKeywordId, config) {

        $scope.config = config;

        $scope.errorMessage = null;
        $scope.loading = true;
        $scope.get = function () {

            keywordService.getSerp(accountDomainKeywordId).then(
                function (response) {
                    $scope.model = response.data.data;
                    $scope.loading = false;

                    $timeout(function () {
                        $location.hash("serppos");
                        $anchorScroll();
                    }, 1000, false);

                }, function (data) {
                    $scope.errorMessage = data.Message;
                    $scope.loading = false;
                }
            );
        };

        $scope.get();
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

angular.module('app').controller('PdfReportPopupCtrl', ['$scope', 'autoReportService', 'accountService', 'keywordService', 'domainService', '$modalInstance', 'request', 'dict', 'domainName', 'config',
    function ($scope, autoReportService, accountService, keywordService, domainService, $modalInstance, request, dict, domainName, config) {

        $scope.config = config;

        $scope.dict = dict;
        $scope.uploadError = null;

        $scope.selectedIndex = null;
        $scope.images = null;
        $scope.Request = request;
        $scope.selectedAccountDomainKeywordGroupId = null;
        $scope.logoUrl = my_ajax_obj.ajax_url + "/image.jpg?ajax_nonce=" +  my_ajax_obj.nonce + "&action=angular_proxy&type=image&Id";

        $scope.getImages = function () {
            accountService.images(function (images) {
                $scope.images = images;
                $scope.selectedIndex = 0;
                $scope.uploadError = null;
            });
        };

        $scope.getKeywordGroupList = function () {
            keywordService.getKeywordFilterList(request.AccountDomainId).then(function (response) {
                if (response.data.success) {
                    $scope.filterOptions = window._.filter(response.data.data, function (option) {
                        return option.Type == 1;
                    });
                }

            }, function (data) {
                console.log(data);
            });
        };

        $scope.deleteLogo = function () {

            accountService.deleteImage($scope.images[$scope.selectedIndex], function (response) {
                if (response.success) {
                    $scope.uploadError = null;
                    $scope.getImages();
                } else {
                    $scope.uploadError = response.error.Message;
                }
            });
        };


        $scope.onFileSelect = function ($files) {
            accountService.uploadImage($files[0], function () {
                $scope.uploadError = null;
                $scope.getImages();
            });
        };

        $scope.next = function () {

            if ($scope.selectedIndex + 1 >= $scope.images.length) {
                $scope.selectedIndex = 0;
            } else {
                $scope.selectedIndex += 1;
            }
        };

        $scope.prev = function () {

            if ($scope.selectedIndex - 1 < 0) {
                $scope.selectedIndex = $scope.images.length - 1;
            } else {
                $scope.selectedIndex -= 1;
            }
        };

        $scope.downloadPdf = function (image, Filter) {
            domainService.getPDF($scope.Request, image, Filter, domainName);
        };

        $scope.getImages();
        $scope.getKeywordGroupList();
        $scope.$on('Error', function (event, msg) {
            $scope.uploadError = msg;
        });


        $scope.cancel = function () {
            $scope.uploadError = null;
            $modalInstance.dismiss('cancel');
        };
    }]);


angular.module('app').controller('AutoReportPopupCtrl', ['$scope', 'accountService', 'autoReportService', '$modalInstance', 'accountDomainId', 'dict', 'config',
    function ($scope, accountService, autoReportService, $modalInstance, accountDomainId, dict, config) {

    $scope.config = config;
    $scope.uploadError = null;
    $scope.dict = dict;
    $scope.model = {};
    $scope.get = function () {
        autoReportService.get(accountDomainId, function (response) {
            if (response.success) {
                $scope.model = response.data;

                if ($scope.model.Filter) {
                    $scope.model.Filter = window._.find($scope.model.FilterOptions, function (o) {
                        return o.Value == $scope.model.Filter.Value && o.Type == $scope.model.Filter.Type;
                    });
                }

                $scope.model.logoUrl = my_ajax_obj.ajax_url + "/image.jpg?ajax_nonce=" +  my_ajax_obj.nonce + "&action=angular_proxy&type=image&Id=" + $scope.model.LogoId;
                $scope.uploadError = null;
            } else {
                $scope.uploadError = response.error;
            }
        });
    };

    $scope.post = function () {
        autoReportService.post(accountDomainId, $scope.model, function (response) {
            if (response.success) {
                $scope.model = response.data;
                $scope.model.logoUrl = my_ajax_obj.ajax_url + "/image.jpg?ajax_nonce=" +  my_ajax_obj.nonce + "&action=angular_proxy&type=image&Id=" + $scope.model.LogoId;
                $scope.uploadError = null;
                $modalInstance.close();
            } else {
                $scope.uploadError = response.error;
            }
        });
    };

    $scope.onFileSelect = function ($files) {
        accountService.uploadImage($files[0], function (response) {
            if (response.success) {
                $scope.model.LogoId = response.data.ImageId;
                $scope.model.logoUrl = my_ajax_obj.ajax_url + "/image.jpg?ajax_nonce=" +  my_ajax_obj.nonce + "&action=angular_proxy&type=image&Id=" + $scope.model.LogoId;
                $scope.uploadError = null;
            }
        });
    };

    $scope.$on('Error', function (event, msg) {
        $scope.uploadError = msg;
    });


    $scope.get();
    $scope.cancel = function () {
        $scope.uploadError = null;
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('app').controller('DeleteKeywordPopupCtrl', ['$scope', '$modalInstance', 'keyword', 'keywordService', 'config',  function ($scope, $modalInstance, keyword, keywordService, config) {

    $scope.config = config;
    $scope.popupLoading = false;
    $scope.deleteKeywordName = keyword.KeywordName;

    $scope.ok = function () {
        $scope.popupLoading = true;
        keywordService.deleteUserDomainKeyword(keyword.UserDomainKeywordId, function (model) {
            $modalInstance.close(model);
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('app').controller('CreateKeywordAccountLimitedPopupCtrl', ['$scope', '$modalInstance', 'dict', '$location', 'config', function ($scope, $modalInstance, dict, $location, config) {

    $scope.dict = dict;
    $scope.popupLoading = false;

    $scope.ok = function () {
        $modalInstance.close();
        $scope.upgrade_now();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('app').controller('CreateKeywordBulkPopupCtrl', ['$scope', '$rootScope', '$modal', '$filter', '$modalInstance', 'keywordService', 'dict', 'userDomainId', 'config', function ($scope, $rootScope, $modal, $filter, $modalInstance, keywordService, dict, userDomainId, config) {

    $scope.bulkErrorMessage = null;
    $scope.popupLoading = false;
    $scope.fileUploading = false;
    $scope.config = config;


    $scope.ok = function (keywords, newGroups) {
        $scope.popupLoading = true;
        var list = $filter('newlineSplit')(keywords);
        $scope.insertBulkKeywords(list, newGroups);
    };

    $scope.insertBulkKeywords = function (newKeywords, newGroups) {

        keywordService.createBulk(userDomainId, newKeywords, newGroups).then(
            function (response) {
                $modalInstance.close(response.data);
            }, function (data) {
                $scope.bulkErrorMessage = data.Message;
                $scope.popupLoading = false;
            }
        );
    };

    $scope.onFileSelect = function ($files) {

        $scope.keywords = "";
        $scope.fileUploading = true;

        keywordService.uploadFile(userDomainId, $files[0]).then(
            function (response) {
                if (response.data.success) {
                    for (var i = 0; i < response.data.data.length; i++) {
                        $scope.keywords += response.data.data[i] + "\n";
                    }

                    $scope.bulkErrorMessage = null;
                    $scope.fileUploading = false;
                }

            }, function (data) {
                $scope.bulkErrorMessage = data.Message;
                $scope.fileUploading = false;
            }
        );
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $scope.popupLoading = false;
        $scope.fileUploading = false;
    };

}]);

angular.module('app').controller('KeywordChartZoomPopupCtrl', ['$scope', '$modalInstance', '$sce', 'filter', 'domainService', 'selectedGraphInterval', 'showCompetitors', 'config', function ($scope, $modalInstance, $sce, filter, domainService, selectedGraphInterval, showCompetitors, config) {
    $scope.config = config;

    $scope.chartLoading = true;

    var h = jQuery(window).width() * 0.6;
    if (h > 600)
        h = 600;

    h = Math.round(h);

    var params = {};

    params.GraphInterval = selectedGraphInterval;
    params.includeCompetitors = showCompetitors;
    params.Height = h;
    params.Filter = filter;

    domainService.getKeywordChartRaw(params, function (response) {

        if (response.success) {
            for (var i = 0; i < response.data.graphs; i++) {
                response.data.graphs[i] = $sce.trustAsHtml(response.data.graphs[i]);
            }

            $scope.amgraphs = response.data.graphs;
            $scope.amdata = response.data.data;
            $scope.chartLoading = false;
        }
    });

    $scope.ok = function () { $modalInstance.close(); };
    $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]);

angular.module('app').controller('DomainChartZoomPopupCtrl', ['$scope', '$modalInstance', '$sce', 'request', 'domainService', 'config', function ($scope, $modalInstance, $sce, request, domainService, config) {
    $scope.config = config;

    request.Height = jQuery(window).width() * 0.6;
    if (request.Height > 600)
        request.Height = 600;

    $scope.chartLoading = true;

    if (request.SelectedAccountDomainKeywordId) {
        domainService.getKeywordChartRaw(request, function (response) {
            if (response.success) {
                for (var i = 0; i < response.data.graphs; i++) {
                    response.data.graphs[i] = $sce.trustAsHtml(response.data.graphs[i]);
                }

                $scope.amgraphs = response.data.graphs;
                $scope.amdata = response.data.data;
                $scope.chartLoading = false;
            }
        });
    } else {
        domainService.getChartRaw(request, function (response) {
            if (response.success) {
                for (var i = 0; i < response.data.graphs; i++) {
                    response.data.graphs[i] = $sce.trustAsHtml(response.data.graphs[i]);
                }

                $scope.amgraphs = response.data.graphs;
                $scope.amdata = response.data.data;
                $scope.chartLoading = false;
            }
        });
    }

    $scope.ok = function () { $modalInstance.close(); };
    $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]);

/*jQuery(document).ready(function($) {
    $.post(my_ajax_obj.ajax_url, {
        _ajax_nonce: my_ajax_obj.nonce,
        action: "angular_proxy"
    }, function(data) {
        console.log('callback')
    });
});*/

angular.module('app').controller('MainController', [
    '$scope',
    function($scope) {
        $scope.title = "Title";
    }]);

angular.module('app')
    .filter('titleCase', function() {
        return function(input) {
            input = input || '';
            return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };
    })

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
};

