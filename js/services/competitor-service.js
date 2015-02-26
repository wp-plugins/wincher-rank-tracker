'use strict';

angular.module('app').service('competitorService',  ['$http', '$q', function ($http, $q) {

    var addCompetitor = function (competitor) {

        var deferred = $q.defer();

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "add_competitor",
            DomainName: encodeURIComponent(competitor.DomainName),
            CompetitorDomainId: -1, //competitor.UserDomainId,
            AccountDomainId: competitor.UserDomainId,
            Id: competitor.Id
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .success(function (data, status, headers, config) {
            var results = [];
            results.data = data;
            results.headers = headers();
            results.status = status;
            results.config = config;
            deferred.resolve(results);
        }).error(function (data, status, headers, config) {
            deferred.reject(data, status, headers, config);
        });

        return deferred.promise;
    };

    var deleteCompetitor = function (id, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "delete_competitor",
            Id: id
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    return {
        addCompetitor: addCompetitor,
        deleteCompetitor: deleteCompetitor
    };
}]);


