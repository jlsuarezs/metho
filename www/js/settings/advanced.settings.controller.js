angular.module("metho.controller.settings.advanced", [])

.controller("InfosAdvancedCtrl", function($scope, Settings, $ionicPopup, $state, $translate) {
    $scope.buy = function() {
        if (Settings.get("advanced")) {
            $translate(["SETTINGS.ADVANCED_MODE.POPUP.ALREADY_TEXT", "SETTINGS.ADVANCED_MODE_LABEL"]).then(function (translations) {
                $ionicPopup.alert({
                    title: translations["SETTINGS.ADVANCED_MODE_LABEL"],
                    template: '<p class="center">' + translations["SETTINGS.ADVANCED_MODE.POPUP.ALREADY_TEXT"] + '</p>'
                }).then(function() {
                    $state.go("tab.settings", {});
                });
            });
        } else {
            // Restore purchases
            // Buy
            // Add Quick Actions
            if (!!window.cordova) {
                ThreeDeeTouch.isAvailable(function (avail) {
                    ThreeDeeTouch.configureQuickActions([
                        {
                            type: 'newsource',
                            title: "Nouvelle source",
                            subtitle: "Créer une nouvelle source",
                            iconType: "Add"
                        },
                        {
                            type: 'scan',
                            title: "Balayage",
                            subtitle: "Balayer un code-barre",
                            iconType: "CapturePhoto"
                        }
                    ]);
                });
            }
            // Activate
            Settings.set("advanced", true);
            $state.go("tab.settings", {});
        }
    }
});
