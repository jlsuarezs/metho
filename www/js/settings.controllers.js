angular.module("metho.controllers.settings", [])


// Settings tab view
.controller('SettingsCtrl', function($scope, localStorageService, Settings) {
    // Get settings from service
    $scope.settings = Settings.all();

    // Commit changes to settings service
    $scope.changeSettings = function (setting) {
        Settings.set(setting, $scope.settings[setting]);
    }

    $scope.$on("$ionicView.afterEnter", function () {
        $scope.settings = Settings.all();
    });
})


// Feedback view
.controller('FeedbackCtrl', function($scope, $cordovaDevice) {
    $scope.newFeedback = function (name) {
        switch (name) {
            case "projects":
                window.plugins.socialsharing.shareViaEmail(
                  "<p>Merci de rapporter un problème. J'essaierai de le régler et de vous répondre rapidement. Veuillez répondre aux questions ci-dessous afin de m'aider à reproduire ce problème. Il n'est pas nécessaire d'inclure des réponses longues, quelques mots sont suffisants.</p><br><strong>À quel endroit se produit ce problème (à l'intérieur de l'onglet projets)?</strong><br><br><br><strong>Décrire le problème.</strong><br><br><br><strong>Décrire comment reproduire le problème (étapes).</strong><br><br><br><strong>Décrire les conséquences du problème (crash de l'application, impossibilité d'ajouter une source, etc.)</strong><br><br><br><p>Merci d'aider à améliorer cette application. Je communiquerai avec vous dans le cas où j'aurais besoin d'information supplémentaire.</p><h5>Ne pas modifier cette section</h5><p>" + $cordovaDevice.getPlatform() + " " + $cordovaDevice.getVersion() + "<br>" + $cordovaDevice.getModel() + "<br>" + (window.screen.width * window.devicePixelRatio) + "x" + (window.screen.height * window.devicePixelRatio) + "<br>Cordova " + $cordovaDevice.getCordova() + "</p>",
                  "Problème dans l'onglet Projets",
                  ['methoappeei@gmail.com@gmail.com'], // TO: must be null or an array
                  [], // CC: must be null or an array
                  null, // BCC: must be null or an array
                  [], // FILES: can be null, a string, or an array
                  function () { // Success
                      console.log("success");
                  },
                  function () { // Error
                      console.log("error");
                  }
                );
                break;
            case "refs":
                window.plugins.socialsharing.shareViaEmail(
                  "<p>Merci de rapporter un problème. J'essaierai de le régler et de vous répondre rapidement. Veuillez répondre aux questions ci-dessous afin de m'aider à reproduire ce problème. Il n'est pas nécessaire d'inclure des réponses longues, quelques mots sont suffisants.</p><br><strong>Quelle rubrique(s) sont concernés par le problème (tous?)?</strong><br><br><br><strong>Décrire le problème.</strong><br><br><br><strong>Décrire comment reproduire le problème (étapes).</strong><br><br><br><strong>Décrire les conséquences du problème (crash de l'application, erreur d'orthographe, etc.)</strong><br><br><br><p>Merci d'aider à améliorer cette application. Je communiquerai avec vous dans le cas où j'aurais besoin d'information supplémentaire.</p><h5>Ne pas modifier cette section</h5><p>" + $cordovaDevice.getPlatform() + " " + $cordovaDevice.getVersion() + "<br>" + $cordovaDevice.getModel() + "<br>" + (window.screen.width * window.devicePixelRatio) + "x" + (window.screen.height * window.devicePixelRatio) + "<br>Cordova " + $cordovaDevice.getCordova() + "</p>",
                  "Problème dans l'onglet Référence",
                  ['methoappeei@gmail.com'], // TO: must be null or an array
                  [], // CC: must be null or an array
                  null, // BCC: must be null or an array
                  [], // FILES: can be null, a string, or an array
                  function () { // Success
                      console.log("success");
                  },
                  function () { // Error
                      console.log("error");
                  }
                );
                break;
            case "settings":
                window.plugins.socialsharing.shareViaEmail(
                  "<p>Merci de rapporter un problème. J'essaierai de le régler et de vous répondre rapidement. Veuillez répondre aux questions ci-dessous afin de m'aider à reproduire ce problème. Il n'est pas nécessaire d'inclure des réponses longues, quelques mots sont suffisants.</p><br><strong>Quelle paramètre(s) sont concernés par le problème (tous?)?</strong><br><br><br><strong>Décrire le problème.</strong><br><br><br><strong>Décrire comment reproduire le problème (étapes).</strong><br><br><br><strong>Décrire les conséquences du problème (crash de l'application, paramètre n'ayant aucun effet, etc.)</strong><br><br><br><p>Merci d'aider à améliorer cette application. Je communiquerai avec vous dans le cas où j'aurais besoin d'information supplémentaire.</p><h5>Ne pas modifier cette section</h5><p>" + $cordovaDevice.getPlatform() + " " + $cordovaDevice.getVersion() + "<br>" + $cordovaDevice.getModel() + "<br>" + (window.screen.width * window.devicePixelRatio) + "x" + (window.screen.height * window.devicePixelRatio) + "<br>Cordova " + $cordovaDevice.getCordova() + "</p>",
                  "Problème concernant les paramètres",
                  ['methoappeei@gmail.com'], // TO: must be null or an array
                  [], // CC: must be null or an array
                  null, // BCC: must be null or an array
                  [], // FILES: can be null, a string, or an array
                  function () { // Success
                      console.log("success");
                  },
                  function () { // Error
                      console.log("error");
                  }
                );
                break;
            case "comment":
                window.plugins.socialsharing.shareViaEmail(
                  "<p>Merci d'émettre un commentaire sur cette application. J'essaierai de vous répondre rapidement.</p><strong>Commentaire</strong><br><br><br>",
                  "Commentaire",
                  ['methoappeei@gmail.com'], // TO: must be null or an array
                  [], // CC: must be null or an array
                  null, // BCC: must be null or an array
                  [], // FILES: can be null, a string, or an array
                  function () { // Success
                      console.log("success");
                  },
                  function () { // Error
                      console.log("error");
                  }
                );
                break;
            case "feature":
                window.plugins.socialsharing.shareViaEmail(
                  "<p>Merci de proposer une fonctionalité. J'essaierai de vous répondre rapidement. Veuillez répondre aux questions ci-dessous afin de m'aider à comprendre votre idée. Il n'est pas nécessaire d'inclure des réponses longues, quelques mots sont suffisants.</p><br><strong>Quelle partie de l'application est concernée?</strong><br><br><br><strong>Décrire la fonctionalité.</strong><br><br><br><p>Merci d'aider à améliorer cette application. Je communiquerai avec vous dans le cas où j'aurais besoin d'information supplémentaire.</p>",
                  "Suggestion de fonctionalité",
                  ['methoappeei@gmail.com'], // TO: must be null or an array
                  [], // CC: must be null or an array
                  null, // BCC: must be null or an array
                  [], // FILES: can be null, a string, or an array
                  function () { // Success
                      console.log("success");
                  },
                  function () { // Error
                      console.log("error");
                  }
                );
                break;
            default:

        }
    }
})

.controller("InfosAdvancedCtrl", function ($scope, Settings, $ionicPopup, $state) {
    $scope.buy = function () {
        if (Settings.get("advanced")) {
            $ionicPopup.alert({
                title: 'Mode avancé',
                template: '<p class="center">Le mode avancé est déjà activé</p>'
            }).then(function () {
                $state.go("tab.settings", {});
            });
        }else {
            // Buy
            
            // Activate
            Settings.set("advanced", true);
            $state.go("tab.settings", {});
        }
    }
});
