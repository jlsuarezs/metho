angular.module("metho.controller.settings.advanced", [])

.controller("InfosAdvancedCtrl", function($scope, Settings, $ionicPopup, $state) {
    $scope.buy = function() {
        if (Settings.get("advanced")) {
            $ionicPopup.alert({
                title: 'Mode avancé',
                template: '<p class="center">Le mode avancé est déjà activé</p>'
            }).then(function() {
                $state.go("tab.settings", {});
            });
        } else {
            // Buy

            // Activate
            Settings.set("advanced", true);
            $state.go("tab.settings", {});
        }
    }
});
