angular.module("metho.controller.settings.attributions", [])

.controller("AttributionsCtrl", function ($scope) {
    $scope.openWebBrowser = function (url) {
        SafariViewController.isAvailable(function(available) {
            if (available) {
                SafariViewController.show({
                        url: url
                    },
                    function(result) {

                    },
                    function(msg) {
                        ReportUser.report(msg);
                });
            } else {
                window.open(url, '_blank', 'location=yes');
            }
        });
    }
});
