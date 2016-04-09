angular.module("metho.controller.projects.pending", [])

.controller("PendingCtrl", function($scope, $stateParams, SharePendings, $ionicModal, $ionicPopup, $ionicScrollDelegate, $ionicLoading, $http, $parseSource, $state) {
    $scope.project = {
        id: $stateParams.projectID,
        sources: []
    };
    $scope.pendings = SharePendings.getPendings();
    $scope.pendingRepo = new PouchDB("pendings");
    $scope.newsource = {};
    $scope.editingISBN = null;
    $scope.editingIndex = null;
    $scope.sourceRepo = new PouchDB("sources");

    $ionicModal.fromTemplateUrl('templates/modal_pending_source.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newSourceModal = modal;
    });

    $scope.$on("$ionicView.beforeLeave", function() {
        SharePendings.setSources($scope.project.sources);
        SharePendings.setPendings($scope.pendings);
    });

    $scope.openAtURL = function(url) {
        SafariViewController.isAvailable(function(available) {
            if (available) {
                SafariViewController.show({
                        url: url
                    },
                    // this success handler will be invoked for the lifecycle events 'opened', 'loaded' and 'closed'
                    function(result) {

                    },
                    function(msg) {
                        alert("KO: " + msg);
                    })
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
            var creatingProj = $parseSource.parseSource($scope.newsource);
            creatingProj.project_id = $stateParams.projectID;
            // Save to db
            $scope.sourceRepo.post(creatingProj).then(function(response) {
                creatingProj._id = response.id;
                creatingProj._rev = response.rev;
                $scope.project.sources.push(creatingProj);
                if ($scope.editingId) {
                    $scope.pendings.splice($scope.editingIndex, 1);
                    $scope.pendingRepo.get($scope.editingId).then(function(doc) {
                        return $scope.pendingRepo.remove(doc);
                    }).then(function(result) {
                        // handle result
                    }).catch(function(err) {
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
                $scope.$apply();
            }).catch(function(err) {
                alert(err);
            });
        } else {
            var alertPopup = $ionicPopup.alert({
                title: 'Erreur',
                template: '<p class="center">La source doit avoir un type.</p>'
            });
            return;
        }
    }

    $scope.deletePending = function (id) {
        $scope.pendingRepo.get(id).then(function (doc) {
            return $scope.pendingRepo.remove(doc);
        }).then(function (res) {
            for (var i = 0; i < $scope.pendings.length; i++) {
                if ($scope.pendings[i]._id == id) {
                    $scope.pendings.splice(i, 1);
                    $scope.$apply();
                }
            }
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
            $http({
                    method: "GET",
                    url: "http://isbndb.com/api/v2/json/YVFT6RLV/book/" + inputISBN
                })
                .then(function(response) { // Success
                    // alert(JSON.stringify(response));
                    if (!!response.data.error) {
                        loading.hide();
                        $ionicPopup.confirm({
                            title: 'Livre introuvable',
                            template: '<p class="center">Le code barre a bien été balayé, mais ce livre ne semble pas faire partie de notre base de données. Voulez-vous rechercher les informations sur Internet?</p>',
                            okText: "Rechercher",
                            cancelText: "Plus tard"
                        }).then(function(res) {
                            if (res) {
                                $scope.newsource.not_available = true;
                                $scope.pendings[$scope.editingIndex].not_available = true;
                                $scope.pendingRepo.put($scope.pendings[$scope.editingIndex]);
                                $scope.openAtURL("http://google.ca/search?q=isbn+" + $scope.pendings[$scope.editingIndex].isbn);
                            } else {
                                $scope.newSourceModal.hide();
                                $scope.newsource = {};
                                $scope.pendings[$scope.editingIndex].not_available = true;
                                $scope.pendingRepo.put($scope.pendings[$scope.editingIndex]);
                                $scope.editingId = null;
                                $scope.editingISBN = null;
                                $scope.editingIndex = null;
                            }
                        });
                    } else {
                        // Titre
                        $scope.newsource.title = response.data.data[0].title;
                        // Publisher/Editor
                        $scope.newsource.editor = response.data.data[0].publisher_name;
                        // Date de publication
                        if (!!response.data.data[0].edition_info && response.data.data[0].edition_info.match(/[0-9]{4}/)) {
                            var working_on_date = response.data.data[0].edition_info.match(/[0-9]{4}/);
                            $scope.newsource.publicationDate = response.data.data[0].edition_info.match(/[0-9]{4}/);
                        } else if (!!response.data.data[0].publisher_text && response.data.data[0].publisher_text.match(/[0-9]{4}/)) {
                            var working_on_date = response.data.data[0].publisher_text.match(/[0-9]{4}/);
                            $scope.newsource.publicationDate = response.data.data[0].publisher_text.match(/[0-9]{4}/);
                        } else {
                            var working_on_date = "";
                        }

                        // Lieu de publication
                        if (response.data.data[0].publisher_text != "") {
                            var working_on_location = response.data.data[0].publisher_text;
                            working_on_location = working_on_location.replace(response.data.data[0].publisher_name, "");
                            working_on_location = working_on_location.replace(working_on_date, "");
                            working_on_location = working_on_location.replace(/[^a-zA-z\s]/g, "");
                            working_on_location = working_on_location.trim();
                            if (working_on_location != "") {
                                $scope.newsource.publicationLocation = working_on_location;
                            }
                        }
                        // Nombre de pages
                        if (response.data.data[0].physical_description_text != "") {
                            var arr_pages = response.data.data[0].physical_description_text.split(" ");
                            if (arr_pages.indexOf("p.") != -1) {
                                var indexOfPages = arr_pages.indexOf("p.") - 1;
                                $scope.newsource.pageNumber = arr_pages[indexOfPages];
                            } else if (arr_pages.indexOf("pages") != -1) {
                                var indexOfPages = arr_pages.indexOf("pages") - 1;
                                $scope.newsource.pageNumber = arr_pages[indexOfPages];
                            }
                        }

                        // Auteur
                        if (response.data.data[0].author_data.length) {
                            for (var i = 0; i < response.data.data[0].author_data.length; i++) {
                                $scope.newsource["author" + String(i + 1) + "lastname"] = response.data.data[0].author_data[i].name.split(",")[0];
                                $scope.newsource["author" + String(i + 1) + "firstname"] = response.data.data[0].author_data[i].name.split(",")[1];
                            }
                            var authorNum = response.data.data[0].author_data.length;
                            if (authorNum >= 1 && authorNum <= 3) {
                                $scope.newsource.hasAuthors = "13";
                            } else if (authorNum > 3) {
                                $scope.newsource.hasAuthors = "more3";
                            }
                        }

                        loading.hide();
                    }
                }, function(response) { // Failure
                    if (response.status == 408) {
                        loading.hide();
                        var alertPopup = $ionicPopup.confirm({
                            title: 'Erreur',
                            template: "<p class='center'>Le temps d'attente est écoulé. Vous vous trouvez probablement sur un réseau lent. Voulez-vous réessayer ?</p>",
                            okText: "Réessayer",
                            okType: "button-balanced",
                            cancelText: "Annuler"
                        });
                        alertPopup.then(function(res) {
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
                    }
                });
        } else {
            var alertPopup = $ionicPopup.confirm({
                title: 'Aucune connexion',
                template: '<p class="center">Voulez-vous réessayer?</p>',
                okText: "Réessayer",
                okType: "button-balanced",
                cancelText: "Annuler"
            });
            alertPopup.then(function(res) {
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
        }
    }
});
