
angular.module('app').service('keywordService', ['$http', '$upload', '$q', '$filter', function ($http, $upload, $q, $filter) {

    var uploadFile = function (accountDomainId, file) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "add_keyword_bulk_file",
            Id: accountDomainId
        }

        var deferred = $q.defer();

        $upload.upload({
            url: my_ajax_obj.ajax_url,
            method: "POST",
            data: params,
            file: file
        }).progress(function (evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {

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

    var getSerp = function (keywordId, accountDomainId, callback) {
        var deferred = $q.defer();

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "keyword_serp",
            Id: keywordId
        }

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

    var track = function (id, callback) {

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "keyword_track",
            Id: id
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    var createKeyword = function (userDomainId, keywordName) {

        var deferred = $q.defer();

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "add_keyword",
            AccountDomainId: userDomainId,
            Keyword: encodeURIComponent(keywordName)
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

    var getKeywordId = function (keywordName, AccountDomainId, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "keyword_id",
            Keyword: keywordName,
            AccountDomainId: AccountDomainId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    var createBulk = function (userDomainId, keywords) {

        var deferred = $q.defer();

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "add_keyword_bulk",
            AccountDomainId: userDomainId,
            Keywords: encodeURIComponent(keywords)
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

    var deleteUserDomainKeyword = function (userDomainKeywordId, callback) {

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "delete_keyword",
            Id: userDomainKeywordId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };
    /*
     var undoDeleteUserDomainKeyword = function (userDomainKeywordId, callback) {

     $http({
     method: 'POST',
     url: '/api/keyword2/UndoDelete/' + userDomainKeywordId
     }).success(function (response) {
     if (callback) {
     callback(response);
     }
     });
     };
     */
    return {
        getKeywordId: getKeywordId,
        getSerp: getSerp,
        createKeyword: createKeyword,
        uploadFile:uploadFile,
        track: track,
        createBulk:createBulk,
        deleteUserDomainKeyword: deleteUserDomainKeyword
    };
}]);


