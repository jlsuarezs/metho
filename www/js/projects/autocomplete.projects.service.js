angular.module("metho.service.projects.autocomplete", [])

.factory("Autocomplete", function ($http, $rootScope, $q, UserReport) {
    var autocompletes = {};

    var loadingAutocompletes = true;
    $http.get("js/projects/autocompletes.json").then(function (response) {
        for (var i = 0; i < response.data.length; i++) {
            for (var ii = 0; ii < response.data[i].from.length; ii++) {
                autocompletes[response.data[i].from[ii]] = { title: response.data[i].title, url: response.data[i].url };
            }
        }
        loadingAutocompletes = false;
        $rootScope.$broadcast("autocompletesLoadingEnded");
    }).catch(function (err) {
        UserReport.report(err);
    });

    return {
        getAutocompletes: function () {
            var p = $q.defer();

            if (loadingAutocompletes) {
                var unregister = $rootScope.$on("autocompletesLoadingEnded", function () {
                    unregister();
                    p.resolve(autocompletes);
                });
            }else {
                p.resolve(autocompletes);
            }

            return p.promise;
        }
    }
})
