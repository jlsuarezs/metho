angular.module("metho.controller.settings.tab", [])

.controller('SettingsCtrl', function($scope, $translate, $ionicPopup, localStorageService, Settings) {
    // Get settings from service
    $scope.settings = Settings.all();
    $scope.name = {
        firstname: $scope.settings["firstName"],
        lastname: $scope.settings["lastName"]
    };

    // Commit changes to settings service
    $scope.changeSettings = function(setting) {
        Settings.set(setting, $scope.settings[setting]);
    }

    $scope.editName = function () {
        $translate(["SETTINGS.EDIT_NAME", "SETTINGS.CANCEL", "SETTINGS.EDIT"]).then(function (translations) {
            $ionicPopup.show({
                template: "<input type='text' ng-model='name.firstname'><br><input type='text' ng-model='name.lastname'>",
                title: translations["SETTINGS.EDIT_NAME"],
                scope: $scope,
                buttons: [
                    {
                        text: translations["SETTINGS.CANCEL"],
                        onTap: function (e) {
                            $scope.name.firstname = $scope.settings["firstName"];
                            $scope.name.lastname = $scope.settings["lastName"];
                        }
                    },
                    {
                        text: "<b>" + translations["SETTINGS.EDIT"] + "</b>",
                        type: "button-positive",
                        onTap: function (e) {
                            Settings.set("firstName", $scope.name.firstname);
                            Settings.set("lastName", $scope.name.lastname);
                            $scope.settings = Settings.all();
                        }
                    }
                ]
            });
        });
    }

    $scope.deleteName = function () {
        Settings.set("firstName", "");
        Settings.set("lastName", "");
        $scope.settings = Settings.all();
    }
    $scope.$on("$ionicView.afterEnter", function() {
        $scope.settings = Settings.all();
    });
});
