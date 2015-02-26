'use strict';

angular.module('app').service('usersService',  ['$http', function ($http) {
    var getCurrentUserName = function (callback) {
        var params = {
            _ajax_nonce: my_ajax_obj.nonce,
            action: "angular_proxy",
            type: "get_current_user_name"
        };

        $http.post(my_ajax_obj.ajax_url, jQuery.param(params), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (n) {
            callback && callback(n)
        })
    }

    return {
        getCurrentUserName: getCurrentUserName
    };
}]);


