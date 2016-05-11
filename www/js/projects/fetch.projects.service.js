angular.module("metho.service.projects.fetch", [])

.factory("Fetch", function ($http, $q) {
    var methods = {};
    var cache = {};

    methods.fromISBNdb = function (isbn) {
        var p = $q.defer();

        $http({
            method: "GET",
            url: "http://isbndb.com/api/v2/json/YVFT6RLV/book/" + isbn
        }).then(function (response) {

        }).catch(function (response) {

        });

        return p.promise;
    }


    return methods;
});
