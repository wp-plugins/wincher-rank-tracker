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
    }, getTags = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "get_tags"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    }, getUserDomain = function (request, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain",
            AccountDomainId: request.AccountDomainId,
            GraphInterval: request.GraphInterval,
            Page: request.Page,
            ResultsPerPage: request.ResultsPerPage,
            OrderBy: request.OrderBy,

            Height: request.Height,
            SelectedAccountDomainKeywordId:request.SelectedAccountDomainKeywordId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    }, getUserDomainKeywords = function (AccountDomainId, callback) {
            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "domain_keywords",
                AccountDomainId: AccountDomainId
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    }, getChart = function (request, callback) {

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "chart",

            AccountDomainId: request.AccountDomainId,
            Height: request.Height ? request.Height : 350,
            Page: request.Page ? request.Page : 1,
            ResultsPerPage: request.ResultsPerPage ? request.ResultsPerPage : 10,
            OrderBy: request.OrderBy,
            GraphInterval: request.GraphInterval
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    }, getChartRaw = function (request, callback) {

            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "chart_raw",

                AccountDomainId: request.AccountDomainId,
                Height: request.Height ? request.Height : 350,
                Page: request.Page ? request.Page : 1,
                ResultsPerPage: request.ResultsPerPage ? request.ResultsPerPage : 10,
                OrderBy: request.OrderBy,
                GraphInterval: request.GraphInterval
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    }, getKeywordChart = function (request, callback) {
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
    }, getKeywordChartRaw = function (request, callback) {
            var params = {
                _ajax_nonce: my_ajax_obj.nonce,
                action: "angular_proxy",
                type: "keyword_chart_raw",

                SelectedAccountDomainKeywordId: request.SelectedAccountDomainKeywordId,
                Height: request.Height,
                GraphInterval: request.GraphInterval,
                IncludeCompetitors: request.includeCompetitors
            };

            $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
                callback && callback(n)
            })
    }, getRankingTrend = function (domainId, summaryInterval, callback) {
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
    }, getRankingSuccesses = function (domainId, count, callback) {
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
    }, getRankingSuccessesPage = function (userDomainId, page, callback) {

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
    },

    getCSV = function (domainId, from, to) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain_csv",
            Id: domainId,
            from: from,
            to: to
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

    getPDF = function (domainId, from, to) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "domain_pdf",
            Id: domainId,
            from: from,
            to: to
        }

        window.open(my_ajax_obj.ajax_url + '?' + jQuery.param(params),'_blank');
    };
    return{getCSV: getCSV, getPDF: getPDF, getUserDomain: getUserDomain, getUserDomainKeywords: getUserDomainKeywords, getRankingTrend: getRankingTrend, getChart: getChart, getChartRaw: getChartRaw, getKeywordChart: getKeywordChart, getKeywordChartRaw: getKeywordChartRaw, getRankingSuccesses: getRankingSuccesses, getRankingSuccessesPage: getRankingSuccessesPage, getDomainId: getDomainId}
}])