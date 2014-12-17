'use strict';

angular.module('app').service('autoReportService', ['$http', '$upload', function ($http, $upload) {

    var get = function (accountDomainId,  callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "autoreport",
            Id: accountDomainId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    var getImage = function (LogoId,  callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "autoreport_image",
            Id: LogoId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };


    var post = function (accountDomainId, model, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "autoreport_edit",
            Id: accountDomainId
        };

        for (var m in model) {
            params[m] = model[m];
        }

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    var uploadLogo = function (accountDomainId, file, callback) {

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "autoreport_edit_file"
        };

        $upload.upload({
            url: my_ajax_obj.ajax_url,
            method: "POST",
            data: params,
            file: file
        }).progress(function (evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
            if (callback) {
                callback(data);
            }
        }).error(function (data, status, headers, config) {
            console.log(data);
        });
    };

    return {
        get: get,
        post: post,
        uploadLogo: uploadLogo
    };
}]);


