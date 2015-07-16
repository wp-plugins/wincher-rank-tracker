'use strict';

angular.module('app').service('groupSearchFactory', ['$http', '$q', 'keywordService', function ($http, $q, keywordService) {


    var keywordGroups;
    var currentGroupIndex;
    var matchingGroups;

    var setKeywordGroups2 = function (groups) {

        keywordGroups = groups;
        /*

        keywordService.getAllGroups(accountDomainId).then(function (response) {
            keywordGroups = response.data;
            console.log(keywordGroups.length + " groups found.");
        }, function () {

        });

        */

    };

    /*
    var setKeywordGroups = function (accountDomainId) {

        keywordService.getAllGroups(accountDomainId).then(function(response) {
            keywordGroups = response.data;
            console.log(keywordGroups.length + " groups found.");
        }, function() {

        });
     


    };
    */

   
    var getMatchingGroups = function (q) {

        currentGroupIndex = null;
        matchingGroups = [];

        if (!q) {
            return matchingGroups;
        }

        if (typeof keywordGroups != 'undefined') {
            for (var i = 0; i < keywordGroups.length; i++) {
                if (keywordGroups[i].Name.lastIndexOf(q, 0) === 0) {
                    matchingGroups.push(keywordGroups[i]);
                }
            }
        }

        if (matchingGroups.length > 0)
            currentGroupIndex = 0;

        return matchingGroups;
    };


    var setSelectedGroupIndex = function (index, selectedCallback) {

        currentGroupIndex = index;
        
        if (matchingGroups && matchingGroups.length > currentGroupIndex) {

            if (selectedCallback) {
                selectedCallback(matchingGroups[currentGroupIndex].Name);
            }
        }

        return currentGroupIndex;
    };

    var getSelectedGroupIndex = function($event, selectedCallback) {

        if (!$event) {
            return currentGroupIndex;
        }
        var code = $event.keyCode;

        // enter
        if (code === 13) {

            if (!matchingGroups || matchingGroups.length == 0) {
                currentGroupIndex = null;
                return currentGroupIndex;
            }

            var selectedGroupName = matchingGroups[currentGroupIndex].Name;

            matchingGroups = [];
            $event.preventDefault();
            currentGroupIndex = null;

            if (selectedCallback) {
                selectedCallback(selectedGroupName);
            }

            return currentGroupIndex;
        }

        // key down
        if (code === 40) {

            if (!currentGroupIndex && currentGroupIndex !== 0)
                currentGroupIndex = 0;
            else if (currentGroupIndex + 1 < matchingGroups.length)
                currentGroupIndex++;

            return currentGroupIndex;
        }

        // key up
        if (code === 38) {

            if (!currentGroupIndex && currentGroupIndex !== 0)
                currentGroupIndex = 0;
            else if (currentGroupIndex - 1 >= 0)
                currentGroupIndex = currentGroupIndex - 1;

            return currentGroupIndex;
        }
        
        return currentGroupIndex;
    };

    return {
        setKeywordGroups2:setKeywordGroups2,
        getMatchingGroups: getMatchingGroups,
        getSelectedGroupIndex: getSelectedGroupIndex,
        setSelectedGroupIndex: setSelectedGroupIndex,
    };
}]);
