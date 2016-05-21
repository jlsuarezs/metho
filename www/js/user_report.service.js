angular.module("metho.service.user_report", [])

.factory("ReportUser", function ($ionicPopup, $translate) {
    return {
        report: function (errString) {
            $translate(["YES", "NO", "REPORT.ERROR", "REPORT.UNKNOWN", "REPORT.REPORT_?","REPORT.DO_NOT_EDIT", "REPORT.TITLE"]).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations["REPORT.ERROR"],
                    subTitle: translations["REPORT.UNKOWN"],
                    template: '<p class="center">' + translations["REPORT.REPORT_?"] + '</p>',
                    okText: translations["YES"],
                    cancelText: translations["NO"]
                }).then(function(res) {
                    if(res) {
                            window.plugins.socialsharing.shareViaEmail(
                                translations['REPORT.DO_NOT_EDIT'] + $cordovaDevice.getPlatform() + " " + $cordovaDevice.getVersion() + "<br>" + $cordovaDevice.getModel() + "<br>" + (window.screen.width * window.devicePixelRatio) + "x" + (window.screen.height * window.devicePixelRatio) + "<br>Cordova " + $cordovaDevice.getCordova() + "</p><br>" + errString,
                                translations['REPORT.TITLE'],
                                ['methoappeei@gmail.com@gmail.com'], // TO: must be null or an array
                                [], // CC: must be null or an array
                                null, // BCC: must be null or an array
                                [], // FILES: can be null, a string, or an array
                                function() { // Success
                                    console.log("success");
                                },
                                function() { // Error
                                    console.log("error");
                                }
                            );
                    }
                });
            });
        }
    }
});
