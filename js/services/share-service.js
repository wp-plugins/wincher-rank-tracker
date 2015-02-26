'use strict';

angular.module('app').service('shareService',  ['$http', '$q', function ($http, $q) {
    var facebookShare = function(response) {
        alert('not implemented yet'); return;

        FB.ui({
            method: 'feed',
            name: response.Name,
            link: response.Link,
            picture: response.Picture,
            caption: response.Caption,
            description: response.Description,
            redirect_uri: response.RedirectUri,
            display: response.Display
        });
    };


    /*var shareSuccessFacebook = function (successId) {
        alert('not implemented yet'); return;

        $http({
            method: 'PUT',
            url: '/api/share/facebook?successId=' + successId
        }).success(function (response) {
            facebookShare(response);
        });
    };*/

    var shareSuccessFacebook = function (successId, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "share_facebook",
            "Id": successId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    /*var reshareSuccessFacebook = function (shareId) {
        alert('not implemented yet'); return;

        $http({
            method: 'PUT',
            url: '/api/share/resharefacebook?shareId=' + shareId
        }).success(function (response) {
            facebookShare(response);
        });
    };*/

    var shareSuccessTwitter = function (successId, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "share_twitter",
            "Id": successId
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };


    /*var reshareSuccessTwitter = function (shareId) {
        alert('not implemented yet'); return;

        $http({
            method: 'PUT',
            url: '/api/share/resharetwitter?shareId=' + shareId
        }).success(function (response) {

            var win = window.open(response.RedirectUri, '_blank');
            win.focus();
        });
    };*/

    var shareSuccessEmail = function (emailTo, from, successId, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "share_email",
            "SuccessId": successId,
            "EmailTo": emailTo,
            "From":  from
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    }

    var sendGraphEmail = function (emailTo, from, accountDomainId, interval, callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "send_graph_email",
            "AccountDomainId": accountDomainId,
            "EmailTo": emailTo,
            "From":  from,
            "GraphInterval": interval
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    };

    return {
        shareSuccessFacebook: shareSuccessFacebook,
        shareSuccessTwitter: shareSuccessTwitter,
        shareSuccessEmail: shareSuccessEmail,
        /*reshareSuccessTwitter: reshareSuccessTwitter,
        reshareSuccessFacebook: reshareSuccessFacebook,*/
        sendGraphEmail: sendGraphEmail
    };;
}]);


