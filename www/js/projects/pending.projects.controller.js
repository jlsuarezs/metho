angular.module("metho.controller.projects.pending", [])

.controller("PendingCtrl", function($scope, $state, $http, $translate, $timeout, $stateParams, $ionicModal, $ionicPopup, $ionicScrollDelegate, $ionicLoading, ParseSource, Storage, Fetch, ReportUser) {
    $scope.project = {
        id: $stateParams.projectID,
        sources: []
    };
    $scope.pendings = [];
    $scope.newsource = {};
    $scope.editingISBN = null;
    $scope.editingIndex = null;
    $scope.removeAnimate = false;

    $ionicModal.fromTemplateUrl('templates/pending.source.modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newSourceModal = modal;
    });

    $scope.loadPendings = function () {
        Storage.getPendingsFromProjectId($scope.project.id).then(function (pendings) {
            $scope.pendings = pendings;
        });
    }

    $scope.loadPendings();

    $scope.openAtURL = function(url) {
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
                // potentially powered by InAppBrowser because that (currently) clobbers window.open
                window.open(url, '_blank', 'location=yes');
            }
        })
    }

    $scope.downloadDetails = function(isbn, id) {
        $scope.newsource.type = "book";
        $scope.newSourceModal.show();
        for (var i = 0; i < $scope.pendings.length; i++) {
            if ($scope.pendings[i]._id == id) {
                var index = i;
                break;
            }
        }
        if ($scope.pendings[index].not_available) {
            $scope.newsource.not_available = true;
            $scope.openAtURL("http://google.ca/search?q=isbn+" + $scope.pendings[index].isbn);
        } else {
            $scope.fetchFromISBNdb(isbn);
        }
        $scope.editingISBN = isbn;
        $scope.editingIndex = index;
        $scope.editingId = id;
    }

    $scope.openWebBrowser = function() {
        $scope.openAtURL("http://google.ca/search?q=isbn+" + $scope.pendings[$scope.editingIndex].isbn);
    }

    $scope.submitSource = function() {
        if ($scope.newsource.type != "" && $scope.newsource.type != null) {
            var creatingProj = ParseSource.parseSource($scope.newsource);
            creatingProj.project_id = $stateParams.projectID;
            // Save to db
            Storage.createSource(creatingProj).then(function(response) {
                if ($scope.editingId) {
                    $scope.pendings.splice($scope.editingIndex, 1);
                    Storage.deletePending($scope.editingId).catch(function (err) {
                        console.log(err);
                    });
                }
                $scope.editingISBN = null;
                $scope.editingIndex = null;
                $scope.editingId = null;
                if ($scope.pendings.length == 0) {
                    $state.go("tab.project-detail", {
                        projectID: $stateParams.projectID
                    });
                }
                $scope.closeModal();
            }).catch(function(err) {
                alert(err);
            });
        } else {
            $translate(["PROJECT.PENDING.POPUP.NEW_SOURCE", "PROJECT.PENDING.POPUP.MUST_HAVE_TYPE"]).then(function (translations) {
                $ionicPopup.alert({
                    title: translations["PROJECT.PENDING.POPUP.NEW_SOURCE"],
                    template: '<p class="center">' + translations["PROJECT.PENDING.POPUP.MUST_HAVE_TYPE"] + '</p>'
                });
            });
        }
    }

    $scope.deletePending = function (id) {
        Storage.deletePending(id).then(function (res) {
            $scope.removeAnimate = true;
            $timeout(function () {
                for (var i = 0; i < $scope.pendings.length; i++) {
                    if ($scope.pendings[i]._id == id) {
                        $scope.pendings.splice(i, 1);
                        $scope.removeAnimate = false;
                    }
                }
            });
        }).catch(function (err) {
            console.log(err);
        });
    }

    $scope.closeModal = function() {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
    }

    $scope.resetModalVars = function() {
        // Reset vars
        $scope.newsource = {};
        $scope.newsource.consultationDate = new Date();
    }

    $scope.refreshModalScroll = function() {
        $ionicScrollDelegate.resize();
    }

    $scope.refreshModalScrollWithDelay = function() {
        setTimeout(function() {
            $ionicScrollDelegate.resize();
        }, 1000);
    }

    // Refresh view on height change
    // $scope.$watch("newsource.hasBeenTranslated", $scope.refreshModalScroll);
    $scope.$watch("newsource.type", $scope.refreshModalScroll);
    $scope.$watch("newsource.hasAuthors", $scope.refreshModalScrollWithDelay);
    $scope.$watch("newsource.author1firstname", $scope.refreshModalScroll);
    $scope.$watch("newsource.author1lastname", $scope.refreshModalScroll);
    $scope.$watch("newsource.author2firstname", $scope.refreshModalScroll);
    $scope.$watch("newsource.author2lastname", $scope.refreshModalScroll);
    $scope.$watch("newsource.translator1firstname", $scope.refreshModalScroll);
    $scope.$watch("newsource.translator1lastname", $scope.refreshModalScroll);
    $scope.$watch("newsource.translator2firstname", $scope.refreshModalScroll);
    $scope.$watch("newsource.translator2lastname", $scope.refreshModalScroll);
    $scope.$watch("newsource.hasBeenTranslated", $scope.refreshModalScrollWithDelay);
    // Keyboard events
    window.addEventListener('keyboardDidHide', $scope.refreshModalScroll);
    window.addEventListener('keyboardWillShow', $scope.refreshModalScroll);

    $scope.fetchFromISBNdb = function(inputISBN) {
        if (navigator.onLine) {
            var loading = $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            Fetch.fromISBNdb(inputISBN).then(function (response) {
                $scope.newsource = response;
                $scope.newsource.type = "book";
                loading.hide();
            }).catch(function (response) {
                loading.hide();
                if (response == 404) {
                    $translate(["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TEXT", "PROJECT.PENDING.POPUP.SEARCH", "PROJECT.PENDING.POPUP.LATER"]).then(function (translations) {
                        $ionicPopup.confirm({
                            title: translations["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TITLE"],
                            template: '<p class="center">' + translations["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TEXT"] + '</p>',
                            okText: translations["PROJECT.PENDING.POPUP.SEARCH"],
                            cancelText: translations["PROJECT.PENDING.POPUP.LATER"]
                        }).then(function(res) {
                            if (res) {
                                $scope.newsource.not_available = true;
                                $scope.pendings[$scope.editingIndex].not_available = true;
                                Storage.setPendingFromId($scope.editingId, $scope.pendings[$scope.editingIndex]);
                                $scope.openAtURL("http://google.ca/search?q=isbn+" + $scope.pendings[$scope.editingIndex].isbn);
                            } else {
                                $scope.newSourceModal.hide();
                                $scope.newsource = {};
                                $scope.pendings[$scope.editingIndex].not_available = true;
                                Storage.setPendingFromId($scope.editingId, $scope.pendings[$scope.editingIndex]);
                                $scope.editingId = null;
                                $scope.editingISBN = null;
                                $scope.editingIndex = null;
                            }
                        });
                    });
                }else if (response == 408) {
                    $translate(["PROJECT.PENDING.POPUP.TIMEOUT_TITLE", "PROJECT.PENDING.POPUP.TIMEOUT_TEXT", "PROJECT.PENDING.POPUP.CANCEL", "PROJECT.PENDING.POPUP.RETRY"]).then(function (translations) {
                        $ionicPopup.confirm({
                            title: translations["PROJECT.PENDING.POPUP.TIMEOUT_TITLE"],
                            template: "<p class='center'>" + translations["PROJECT.PENDING.POPUP.TIMEOUT_TEXT"] + "</p>",
                            okText: translations["PROJECT.PENDING.POPUP.RETRY"],
                            okType: "button-balanced",
                            cancelText: translations["PROJECT.PENDING.POPUP.CANCEL"]
                        }).then(function(res) {
                            if (res) {
                                $scope.fetchFromISBNdb(inputISBN);
                            } else {
                                $scope.newSourceModal.hide();
                                $scope.newsource = {};
                                $scope.editingId = null;
                                $scope.editingISBN = null;
                                $scope.editingIndex = null;
                            }
                        });
                    });
                }
            });
        } else {
            $translate(["PROJECT.PENDING.POPUP.NO_CONNECTION", "PROJECT.PENDING.POPUP.RETRY_?", "PROJECT.PENDING.POPUP.RETRY", "PROJECT.PENDING.POPUP.CANCEL"]).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations["PROJECT.PENDING.POPUP.NO_CONNECTION"],
                    template: '<p class="center">' + translations["PROJECT.PENDING.POPUP.RETRY_?"] + '</p>',
                    okText: translations["PROJECT.PENDING.POPUP.RETRY"],
                    okType: "button-balanced",
                    cancelText: translations["PROJECT.PENDING.POPUP.CANCEL"]
                }).then(function(res) {
                    if (res) {
                        $scope.fetchFromISBNdb(inputISBN);
                    } else {
                        $scope.newSourceModal.hide();
                        $scope.newsource = {};
                        $scope.editingId = null;
                        $scope.editingISBN = null;
                        $scope.editingIndex = null;
                    }
                });
            });
        }
    }
});
