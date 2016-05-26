angular.module("metho.controller.projects.source", [])

.controller('SourceDetailCtrl', function($scope, $rootScope, $stateParams, $translate, $ionicPopup, $ionicModal, ParseSource, Storage) {
    $scope.source = {};
    $scope.loading = false;
    $scope.errors = {};
    $scope.warnings = {};

    $scope.loadSource = function () {
        Storage.getSourceFromId($stateParams.sourceID).then(function (result) {
            $scope.source = result;
        });
    }

    $scope.loadSource();

    $rootScope.$on("$translateChangeSuccess", function () {
        $scope.loadSource();
    });

    $ionicModal.fromTemplateUrl('templates/edit.source.modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.editSourceModal = modal;
    });

    $scope.solveError = function(id) {
        $translate(["PROJECT.SOURCE.CONFIRM", "PROJECT.SOURCE.CANCEL"]).then(function (translations) {
            if (!!window.cordova) {
                cordova.plugins.Keyboard.disableScroll(false);
            }
            if ($scope.source.errors[id].complex) {
                if (!!window.cordova) {
                    if ($scope.source.errors[id].type == "select") {
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                    }else {
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    }
                }
                $ionicPopup.show({
                    title: $scope.source.errors[id].promptTitle,
                    subTitle: $scope.source.errors[id].promptText,
                    template: $scope.source.errors[id].template,
                    scope: $scope,
                    buttons: [
                        {
                            text: translations["PROJECT.SOURCE.CANCEL"]
                        },
                        {
                            text: "<b>" + translations["PROJECT.SOURCE.CONFIRM"] + "</b>",
                            type: "button-positive",
                            onTap: function(e) {
                                return true;
                            }
                        }
                    ]
                }).then(function(res) {
                    if (res) {
                        $scope.source[$scope.source.errors[id].var] = $scope.errors.result;
                        $scope.errors.result = null;
                        $scope.source = ParseSource.parseSource($scope.source);
                        Storage.setSourceFromId($scope.source._id, $scope.source).then(function(response) {
                            $scope.source._rev = response.rev;
                        });
                    }
                });
            } else {
                if (!!window.cordova) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                // Wrap firstname or lastname mention in <b></b>
                if (author_label.indexOf($scope.source.errors[id].promptTitle.toLowerCase()) >= 0) {
                    var subtitle = wrapInBold($scope.source.errors[id].promptText, name_labels);
                }else {
                    var subtitle = $scope.source.errors[id].promptText;
                }

                var popup = $ionicPopup.show({
                    title: $scope.source.errors[id].promptTitle,
                    subTitle: subtitle,
                    scope: $scope,
                    template: '<input type="text" ng-model="errors.result" ng-autofocus delay="275" ng-keyup="$event.keyCode == 13 && popup.close()">',
                    buttons: [
                        {
                            text: translations["PROJECT.SOURCE.CANCEL"],
                            onTap: function (e) {
                                return false;
                            }
                        },
                        {
                            text: "<b>" + translations["PROJECT.SOURCE.CONFIRM"] + "</b>",
                            type: "button-positive",
                            onTap: function (e) {
                                return true;
                            }
                        }
                    ]
                });
                $scope.popup = popup;
                popup.then(function(res) {
                    if (res != false) {
                        $scope.source[$scope.source.errors[id].var] = $scope.errors.result;
                        $scope.errors.result = null;
                        $scope.source = ParseSource.parseSource($scope.source);
                        Storage.setSourceFromId($scope.source._id, $scope.source).then(function(response) {
                            $scope.source._rev = response.rev;
                        });
                    }
                });
            }
        });
    }

    $scope.solveWarning = function(id) {
        $translate(["PROJECT.SOURCE.CONFIRM", "PROJECT.SOURCE.CANCEL"]).then(function (translations) {
            if (!!window.cordova) {
                cordova.plugins.Keyboard.disableScroll(false);
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            var popup = $ionicPopup.show({
                title: $scope.source.warnings[id].promptTitle,
                subTitle: $scope.source.warnings[id].promptText,
                scope: $scope,
                template: '<input type="text" ng-model="warnings.result" ng-autofocus delay="275" ng-keyup="$event.keyCode == 13 && popup.close()">',
                buttons: [
                    {
                        text: translations["PROJECT.SOURCE.CANCEL"],
                        onTap: function (e) {
                            return false;
                        }
                    },
                    {
                        text: "<b>" + translations["PROJECT.SOURCE.CONFIRM"] + "</b>",
                        type: "button-positive",
                        onTap: function (e) {
                            return true;
                        }
                    }
                ]
            });
            $scope.popup = popup;
            popup.then(function(res) {
                if (res != false) {
                    $scope.source[$scope.source.warnings[id].var] = $scope.warnings.result;
                    $scope.warnings.results = null;
                    $scope.source = ParseSource.parseSource($scope.source);
                    Storage.setSourceFromId($scope.source._id, $scope.source).then(function(response) {
                        $scope.source._rev = response.rev;
                    });
                }
            });
        });
    }

    $scope.edit = function() {
        if (!!window.cordova) {
            cordova.plugins.Keyboard.disableScroll(false);
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        }
        $scope.newsource = JSON.parse(JSON.stringify($scope.source));
        if ($scope.newsource.consultationDate != null && $scope.newsource.consultationDate != "") {
            $scope.newsource.consultationDate = new Date($scope.newsource.consultationDate);
        }
        $scope.editSourceModal.show();
    }

    $scope.cancelEdit = function() {
        $scope.newsource = {};
        $scope.editSourceModal.hide();
    }

    $scope.submitEdit = function() {
        $scope.source = ParseSource.parseSource($scope.newsource);
        $scope.editSourceModal.hide();
        $scope.newsource = {};
        Storage.setSourceFromId($scope.source._id, $scope.source).then(function(response) {
            $scope.source._rev = response.rev;
        });
    }

    // Init if service is unavailable (debug when reloading the page)
    if ($scope.source == null) {
        $scope.loading = true;
        Storage.getSourceFromId($stateParams.sourceID).then(function(result) {
            $scope.source = result;
            $scope.loading = false;
        });
    }
});
