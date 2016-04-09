angular.module("metho.controller.settings.tab", [])

.controller('SettingsCtrl', function($scope, localStorageService, Settings) {
    // Get settings from service
    $scope.settings = Settings.all();

    // Commit changes to settings service
    $scope.changeSettings = function(setting) {
        Settings.set(setting, $scope.settings[setting]);
    }

    $scope.$on("$ionicView.afterEnter", function() {
        $scope.settings = Settings.all();
    });
});
