'use strict';

angular.module('app').service("domainService", ["$http", "$q", function ($http, $q) {
    var getDomainId = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain_id"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getTags = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "get_tags"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getUserDomain = function (request, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain",
            AccountDomainId: request.AccountDomainId,
            GraphInterval: request.GraphInterval,
            Page: request.Page,
            ResultsPerPage: request.ResultsPerPage,
            OrderBy: request.OrderBy,
            Filter: request.Filter,
            SortBy: request.SortBy,
            GraphHeight: request.GraphHeight,

            Height: request.Height,
            SelectedAccountDomainKeywordId:request.SelectedAccountDomainKeywordId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getDictionary = function (callback) {
            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "dictionary"
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    },
    getUserDomainKeywords = function (AccountDomainId, callback) {
            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "domain_keywords",
                AccountDomainId: AccountDomainId
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    },
    getChart = function (request, callback) {

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "chart",

            AccountDomainId: request.AccountDomainId,
            Height: request.Height ? request.Height : 350,
            Page: request.Page ? request.Page : 1,
            ResultsPerPage: request.ResultsPerPage ? request.ResultsPerPage : 10,
            OrderBy: request.OrderBy,
            GraphInterval: request.GraphInterval,
            Filter: request.Filter,
            SortBy: request.SortBy,
            GraphHeight: request.GraphHeight
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getChartRaw = function (request, callback) {

            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "chart_raw",

                AccountDomainId: request.AccountDomainId,
                Height: request.Height ? request.Height : 350,
                Page: request.Page ? request.Page : 1,
                ResultsPerPage: request.ResultsPerPage ? request.ResultsPerPage : 10,
                OrderBy: request.OrderBy,
                GraphInterval: request.GraphInterval,
                Filter: request.Filter,
                SortBy: request.SortBy,
                GraphHeight: request.GraphHeight
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    },
    getKeywordChart = function (request, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "keyword_chart",

            SelectedAccountDomainKeywordId: request.SelectedAccountDomainKeywordId,
            Height: request.Height,
            GraphInterval: request.GraphInterval,
            IncludeCompetitors: request.IncludeCompetitors
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getKeywordChartRaw = function (request, callback) {
            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "keyword_chart_raw",
                Height: request.Height,
                GraphInterval: request.GraphInterval,
                IncludeCompetitors: request.includeCompetitors,
                Filter: request.Filter,
                SortBy: request.SortBy
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    },
    getRankingTrend = function (domainId, summaryInterval, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "trend",
            AccountDomainId: domainId,
            GraphInterval: summaryInterval
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getRankingSuccesses = function (domainId, count, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "lastest_notifications",
            AccountDomainId: domainId,
            Count: count
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getRankingSuccessesPage = function (userDomainId, page, callback) {

        if (userDomainId) {

            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "notifications",
                page: page,
                id: userDomainId
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
        }
    }
        ,
    getCSV = function (domainId, request) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain_csv",
            Id: domainId,
            GraphInterval: request.GraphInterval
        }

        var hiddenIFrameID = 'hiddenDownloader',
            iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = my_ajax_obj.ajax_url + '?' + jQuery.param(params);
    },
    getSimpleCSV = function (domainId, request) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain_simple_csv",
            Id: domainId,
            GraphInterval: request.GraphInterval
        };

        var hiddenIFrameID = 'hiddenDownloader',
            iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = my_ajax_obj.ajax_url + '?' + jQuery.param(params);
    },

    getPDF = function (request, image, Filter, domainName) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain_pdf",
            AccountDomainId: request.AccountDomainId,
            GraphInterval: request.GraphInterval,
            Filter: Filter,
            LogoId: image
        };

        var hiddenIFrameID = 'hiddenDownloader',
            iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = my_ajax_obj.ajax_url + '/' + domainName + '_pdf.pdf?' + jQuery.param(params);
    };
    return {
        getCSV: getCSV,
        getSimpleCSV: getSimpleCSV,
        getPDF: getPDF,
        getUserDomain: getUserDomain,
        getDictionary: getDictionary,
        getUserDomainKeywords: getUserDomainKeywords,
        getRankingTrend: getRankingTrend,
        getChart: getChart,
        getChartRaw: getChartRaw,
        getKeywordChart: getKeywordChart,
        getKeywordChartRaw: getKeywordChartRaw,
        getRankingSuccesses: getRankingSuccesses,
        getRankingSuccessesPage: getRankingSuccessesPage,
        getDomainId: getDomainId}
}])