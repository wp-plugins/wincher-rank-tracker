'use strict';

angular.module('app').service('accountService',  ['$http', '$upload', function ($http, $upload) {
    var getAccount = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "get_account"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    getAccountUser = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "get_account_user"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    images = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "image_all"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    deleteImage = function (imageId, callback) {

        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "image_delete",
            id: imageId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    },
    uploadImage = function (file, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "image_upload"
        };

        $upload.upload({
            url: my_ajax_obj.ajax_url,
            method: "POST",
            data: params,
            file: file
        }).progress(function (evt) {
            //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
            if (callback) {
                callback(data);
            }
        }).error(function (data, status, headers, config) {
            console.log(data);
        });
    };

    return {
        getAccount: getAccount,
        getAccountUser: getAccountUser,
        images: images,
        deleteImage: deleteImage,
        uploadImage: uploadImage
    };
}]);


