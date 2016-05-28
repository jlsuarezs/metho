angular.module('metho.controller.projects.detail', [])

.controller('ProjectDetailCtrl', function($scope, $rootScope, $state, $http, $timeout, $translate, $stateParams, $ionicModal, $ionicPopup, $ionicScrollDelegate, $ionicListDelegate, $ionicActionSheet, $ionicLoading, $ionicSlideBoxDelegate, $ionicBackdrop, ParseSource, Settings, Storage, Fetch, Autocomplete, ReportUser) {
    $scope.project = {
        name: "",
        id: $stateParams.projectID,
        matter: "",
        sources: [],
        pendings: 0
    };
    $scope.loading = true;
    $scope.newsource = {};
    $scope.newsource.consultationDate = new Date();
    $scope.refreshID = null;
    $scope.refreshIndex = null;
    $scope.removeAnimate = false;
    $scope.refreshPending = false;
    $scope.autocompletes = {};
    $scope.isAdvanced = Settings.get("advanced");
    var _timeout;

    $scope.loadSources = function () {
        Storage.getSourcesFromProjectId($scope.project.id).then(function(result) {
            $scope.loading = true;
            $scope.project.sources = result;
            $scope.project.sources.sort(function(a, b) {
                if (a.title && b.title) {
                    return a.title.localeCompare(b.title);
                } else if (a.title) {
                    return a.title.localeCompare(b.parsedSource);
                } else if (b.title) {
                    return a.parsedSource.localeCompare(b.title);
                }
            });
            $scope.loading = false;
        }).catch(function (err) {
            $scope.loading = false;
            $scope.project.sources = [];
        });
    }

    $scope.loadSources();

    $scope.loadProjectInfo = function () {
        Storage.getProjectFromId($scope.project.id).then(function (project) {
            $translate("PROJECT.TAB.UNKNOWN_MATTER").then(function (unknown) {
                $scope.project.name = project.name;
                $scope.project.matter = project.matter == "" ? unknown : project.matter;
            });
        });
    }

    $scope.loadProjectInfo();

    $rootScope.$on("$translateChangeSuccess", function () {
        $scope.loadSources();
        if (unknown_subjects.indexOf($scope.project.matter) >= 0) {
            $translate("PROJECT.TAB.UNKNOWN_MATTER").then(function (unknown) {
                $scope.project.matter = unknown;
            });
        }
    });

    $scope.loadPendings = function () {
        Storage.getPendingNumber($scope.project.id).then(function(result) {
            $scope.project.pendings = result;
        });
    }

    $scope.loadPendings();

    Autocomplete.getAutocompletes().then(function (response) {
        $scope.autocompletes = response;
    });

    // New source modal
    $ionicModal.fromTemplateUrl('templates/new.source.modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newSourceModal = modal;
        if ($scope.isAdvanced) {
            $scope.$watch("newsource.title", function () {
                if ($scope.newSourceModal.isShown() && $scope.newsource.type == "book" && !$scope.insertingFromScan) {
                    if (_timeout) {
                        $timeout.cancel(_timeout);
                    }
                    var onSuccess = function (response) {
                        if (response.length == 0) {
                            $scope.loadingSuggestions = false;
                            $scope.noSuggestion = true;
                        }else {
                            $scope.suggestions = response.slice(0, 4);
                            $scope.loadingSuggestions = false;
                            $scope.endSuggestionLoading = true;
                        }
                    }
                    var onFailure = function (err) {
                        $scope.loadingSuggestions = false;
                        if (err == 404) {
                            $scope.noSuggestion = true;
                        }else if (err == 408) {
                            $scope.slowConnection = true;
                        }else if (err >= 500 && err <= 600) {
                            $scope.errServer = true;
                        }else {
                            ReportUser.report(err);
                            $scope.noSuggestion = true;
                        }
                    }
                    _timeout = $timeout(function () {
                        if ($scope.newSourceModal.isShown()) {
                            $scope.showSuggestions = false;
                            $scope.noSuggestion = false;
                            $scope.loadingSuggestions = true;
                            $scope.errServer = false;
                            $timeout(function () {
                                if ($scope.newsource.author1firstname || $scope.newsource.author1lastname) {
                                    Fetch.fromNameISBNdb($scope.newsource.title, ($scope.newsource.author1firstname ? $scope.newsource.author1firstname : "") + " " + ($scope.newsource.author1lastname ? $scope.newsource.author1lastname : "")).then(onSuccess).catch(onFailure);
                                }else {
                                    Fetch.fromNameISBNdb($scope.newsource.title).then(onSuccess).catch(onFailure);
                                }
                                _timeout = null;
                            });
                        }
                    }, 1500);
                }else {
                    _timeout = null;
                    $scope.insertingFromScan = false;
                }
            });
        }
        if ($stateParams.scanSource){
            if (!!window.cordova) {
                cordova.plugins.Keyboard.disableScroll(true);
            }
            $scope.newsource.type = "book";
            $scope.newSourceModal.show();
            $scope.scanBook();
        }
    });

    $scope.toggleShowSuggestion = function () {
        $scope.showSuggestions = $scope.showSuggestions ? false : true;
    }

    $scope.fillWithInfos = function (index) {
        if ($scope.isNewSourceEmpty(false)) {
            $scope.newsource.author1firstname = $scope.suggestions[index].author1firstname;
            $scope.newsource.author1lastname = $scope.suggestions[index].author1lastname;
            $scope.newsource.author2firstname = $scope.suggestions[index].author2firstname;
            $scope.newsource.author2lastname = $scope.suggestions[index].author2lastname;
            $scope.newsource.author3firstname = $scope.suggestions[index].author3firstname;
            $scope.newsource.author3lastname = $scope.suggestions[index].author3lastname;
            $scope.newsource.hasAuthors = $scope.suggestions[index].hasAuthors;
            $scope.newsource.title = $scope.suggestions[index].title;
            $scope.newsource.editor = $scope.suggestions[index].editor;
            $scope.newsource.publicationDate = $scope.suggestions[index].publicationDate;
            $scope.newsource.publicationLocation = $scope.suggestions[index].publicationLocation;
            $scope.newsource.pageNumber = $scope.suggestions[index].pageNumber;

            $scope.showSuggestions = false;
            $scope.insertingFromScan = true;
        }else {
            $translate(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "PROJECT.DETAIL.POPUP.CANCEL"]).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE"],
                    template: "<p class='center'>" + translations["PROJECT.DETAIL.POPUP.AUTO_FILL_DESC"] + "</p>",
                    okText: translations["PROJECT.DETAIL.POPUP.OVERWRITE"],
                    okType: "button-assertive",
                    cancelText: translations["PROJECT.DETAIL.POPUP.CANCEL"]
                }).then(function(res) {
                    if(res) {
                        $scope.newsource.author1firstname = $scope.suggestions[index].author1firstname;
                        $scope.newsource.author1lastname = $scope.suggestions[index].author1lastname;
                        $scope.newsource.author2firstname = $scope.suggestions[index].author2firstname;
                        $scope.newsource.author2lastname = $scope.suggestions[index].author2lastname;
                        $scope.newsource.author3firstname = $scope.suggestions[index].author3firstname;
                        $scope.newsource.author3lastname = $scope.suggestions[index].author3lastname;
                        $scope.newsource.hasAuthors = $scope.suggestions[index].hasAuthors;
                        $scope.newsource.title = $scope.suggestions[index].title;
                        $scope.newsource.editor = $scope.suggestions[index].editor;
                        $scope.newsource.publicationDate = $scope.suggestions[index].publicationDate;
                        $scope.newsource.publicationLocation = $scope.suggestions[index].publicationLocation;
                        $scope.newsource.pageNumber = $scope.suggestions[index].pageNumber;

                        $scope.showSuggestions = false;
                        $scope.insertingFromScan = true;
                    }else {
                        $scope.showSuggestions = false;
                    }
                });
            });
        }
    }

    $scope.openExplainingPopup = function () {
        if ($scope.noSuggestion) {
            $translate(["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS", "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC"]).then(function (translations) {
                $ionicPopup.alert({
                    title: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS"],
                    template: "<p class='center'>" + translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC"] + "</p>"
                });
            });
        }else if ($scope.errServer) {
            $translate(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500"]).then(function (translations) {
                $ionicPopup.alert({
                    title: translations["PROJECT.DETAIL.POPUP.ERROR"],
                    template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.ERROR_500"] + '</p>'
                });
            });
        }
    }

    $scope.addSource = function() {
        // Open modal
        $translate(["PROJECT.TYPES.BOOK", "PROJECT.TYPES.ARTICLE", "PROJECT.TYPES.INTERNET", "PROJECT.TYPES.CD", "PROJECT.TYPES.MOVIE", "PROJECT.TYPES.INTERVIEW", "PROJECT.DETAIL.CHOOSE_TYPE", "PROJECT.DETAIL.POPUP.CANCEL"]).then(function (translations) {
            $ionicActionSheet.show({
                buttons: [{
                    text: translations["PROJECT.TYPES.BOOK"]
                }, {
                    text: translations["PROJECT.TYPES.ARTICLE"]
                }, {
                    text: translations["PROJECT.TYPES.INTERNET"]
                }, {
                    text: translations["PROJECT.TYPES.CD"]
                }, {
                    text: translations["PROJECT.TYPES.MOVIE"]
                }, {
                    text: translations["PROJECT.TYPES.INTERVIEW"]
                }],
                titleText: translations["PROJECT.DETAIL.CHOOSE_TYPE"],
                cancelText: translations["PROJECT.DETAIL.POPUP.CANCEL"],
                buttonClicked: function(index) {
                    switch (index) {
                        case 0:
                            $scope.newsource.type = "book";
                            break;
                        case 1:
                            $scope.newsource.type = "article";
                            break;
                        case 2:
                            $scope.newsource.type = "internet";
                            break;
                        case 3:
                            $scope.newsource.type = "cd";
                            break;
                        case 4:
                            $scope.newsource.type = "movie";
                            break;
                        case 5:
                            $scope.newsource.type = "interview";
                            $scope.newsource.author1lastname = Settings.get("lastName");
                            $scope.newsource.author1firstname = Settings.get("firstName");
                            break;
                        default:

                    }
                    if (!!window.cordova) {
                        cordova.plugins.Keyboard.disableScroll(true);
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                    }
                    $scope.newSourceModal.show();
                    return true;
                }
            });
        });
    }

    $scope.resetModalVars = function() {
        // Reset vars
        $scope.newsource = {};
        $scope.newsource.consultationDate = new Date();
        $scope.suggestions = [];
        $scope.showSuggestions = false;
        $scope.endSuggestionLoading = false;
        $scope.noSuggestion = false;
        $scope.loadingSuggestions = false;
    }

    $scope.refreshModalScroll = function() {
        $ionicScrollDelegate.resize();
    }

    $scope.refreshModalScrollWithDelay = function() {
        setTimeout(function() {
            $ionicScrollDelegate.resize();
        }, 1000);
    }

    $scope.autoCompleteEditor = function() {
        if ($scope.newsource.type == "internet") {
            if ($scope.autocompletes[$scope.newsource.editor.toLowerCase()]) {
                $scope.newsource.url = $scope.autocompletes[$scope.newsource.editor.toLowerCase()].url;
                $scope.newsource.editor = $scope.autocompletes[$scope.newsource.editor.toLowerCase()].title;
            }
        }
    }

    $scope.isNewSourceEmpty = function (includeTitle) {
        if (!$scope.newsource.author1firstname && !$scope.newsource.author1lastname && !$scope.newsource.author2firstname && !$scope.newsource.author2lastname && !$scope.newsource.author3firstname && !$scope.newsource.author3lastname && !$scope.newsource.editor && !$scope.newsource.hasAuthors && !$scope.newsource.pageNumber && !$scope.newsource.publicationDate && !$scope.newsource.publicationLocation && !$scope.newsource.url) {
            if (includeTitle) {
                if (!$scope.newsource.title) {
                    return true;
                }else {
                    return false;
                }
            }else {
                return true;
            }
        }else {
            return false;
        }
    }

    $scope.closeModal = function() {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
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
    $scope.$watch("newsource.editor", $scope.autoCompleteEditor);
    // Keyboard events
    window.addEventListener('keyboardDidHide', $scope.refreshModalScroll);
    window.addEventListener('keyboardWillShow', $scope.refreshModalScroll);


    // Boarding
    $ionicModal.fromTemplateUrl('templates/boarding.scan.modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.scanBoardingModal = modal;
    });

    $scope.closeBoarding = function() {
        $scope.scanBoardingModal.hide();
        Settings.set("scanBoardingDone", true);
        $scope.scanBook();
    }

    $scope.slideHasChanged = function(index) {
        $scope.boardingIndex = index;
    }

    $scope.nextSlideBoarding = function() {
        $ionicSlideBoxDelegate.next();
    }

    $scope.lastSlideBoarding = function() {
        $ionicSlideBoxDelegate.previous();
    }

    // Share
    $scope.share = function() {
        $translate(["PROJECT.DETAIL.SHARE_TEXT", "PROJECT.DETAIL.POPUP.ORDER_TITLE", "PROJECT.DETAIL.POPUP.ORDER_SUB", "PROJECT.DETAIL.POPUP.ALPHA", "PROJECT.DETAIL.POPUP.TYPE"], { project_title: $scope.project.name }).then(function (translations) {
            var textToShare = translations["PROJECT.DETAIL.SHARE_TEXT"];
            if (Settings.get("askForOrder")) {
                var cancel = Settings.get("defaultOrder") == "alpha" ? "button-positive" : "button-stable";
                var ok = Settings.get("defaultOrder") == "type" ? "button-positive" : "button-stable";
                // display modal
                $ionicPopup.confirm({
                    title: translations["PROJECT.DETAIL.POPUP.ORDER_TITLE"],
                    subTitle: translations["PROJECT.DETAIL.POPUP.ORDER_SUB"],
                    cssClass: "popup-vertical-buttons",
                    cancelText: translations["PROJECT.DETAIL.POPUP.ALPHA"],
                    cancelType: cancel,
                    okText: translations["PROJECT.DETAIL.POPUP.TYPE"],
                    okType: ok
                }).then(function(res) {
                    if (!res) { // Ordre alphabétique
                        $scope.shareByAlpha(textToShare);
                    } else { // Type d'ouvrage
                        $scope.shareByType(textToShare);
                    }
                });
            } else if (Settings.get("defaultOrder") == "alpha") {
                $scope.shareByAlpha(textToShare);
            } else { // defaultOrder == type
                $scope.shareByType(textToShare);
            }
        });
    }

    $scope.shareByAlpha = function (textToShare) {
        var errNum = 0;
        var arr_sources = JSON.parse(JSON.stringify($scope.project.sources)).sort(function(a, b) {
            return a.parsedSource.localeCompare(b.parsedSource);
        });
        for (var i = 0; i < arr_sources.length; i++) {
            textToShare += arr_sources[i].parsedSource + "<br><br>";
            errNum += arr_sources[i].errors.length;
        }

        if (errNum > 0) {
            $translate(["PROJECT.DETAIL.POPUP.ERRORS_SOURCES", "PROJECT.DETAIL.POPUP.SHARE_TEXT", "PROJECT.DETAIL.POPUP.SHARE", "PROJECT.DETAIL.POPUP.CANCEL"], { errNum:errNum }).then(function (translations) {
                var confirmPopup = $ionicPopup.confirm({
                    title: translations["PROJECT.DETAIL.POPUP.SHARE_TEXT"],
                    template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.ERRORS_SOURCES"] + '</p>',
                    cancelText: translations["PROJECT.DETAIL.POPUP.CANCEL"],
                    okText: '<b>' + translations["PROJECT.DETAIL.POPUP.SHARE"] + '</b>'
                }).then(function(res) {
                    if (res) {
                        if (!!window.cordova) {
                            window.plugins.socialsharing.shareViaEmail(
                                textToShare,
                                $scope.project.name, [], // TO: must be null or an array
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
                        }else {
                           $ionicPopup.alert({
                             title: $scope.project.name,
                             template: '<div class="interact">' + textToShare + "</div>"
                           });
                        }
                    } else {
                        console.log("Cancelled by user");
                    }
                });
            });
        } else {
            if (!!window.cordova) {
                window.plugins.socialsharing.shareViaEmail(
                    textToShare,
                    $scope.project.name, [], // TO: must be null or an array
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
            }else {
               $ionicPopup.alert({
                 title: $scope.project.name,
                 template: '<div class="interact">' + textToShare + "</div>"
               });
            }
        }
    }

    $scope.shareByType = function (textToShare) {
        var errNum = 0;
        var arr_sources = JSON.parse(JSON.stringify($scope.project.sources)).sort(function(a, b) {
            return a.parsedSource.localeCompare(b.parsedSource);
        });
        var arr_book = "";
        var arr_article = "";
        var arr_internet = "";
        var arr_cd = "";
        var arr_movie = "";
        var arr_interview = "";
        for (var i = 0; i < arr_sources.length; i++) {
            switch (arr_sources[i].type) {
                case "book":
                    arr_book += arr_sources[i].parsedSource + "<br>";
                    break;
                case "article":
                    arr_article += arr_sources[i].parsedSource + "<br>";
                    break;
                case "internet":
                    arr_internet += arr_sources[i].parsedSource + "<br>";
                    break;
                case "cd":
                    arr_cd += arr_sources[i].parsedSource + "<br>";
                    break;
                case "movie":
                    arr_movie += arr_sources[i].parsedSource + "<br>";
                    break;
                case "interview":
                    arr_interview += arr_sources[i].parsedSource + "<br>";
                    break;
                default:

            }
            errNum += arr_sources[i].errors.length;
        }
        categoryNum = 0;
        if (arr_book != "") {
            categoryNum++;
            textToShare += categoryNum + ". Ouvrages généraux<br>" + arr_book;
        }

        if (arr_article != "") {
            categoryNum++;
            textToShare += categoryNum + ". Articles de périodiques<br>" + arr_article;
        }

        if (arr_internet != "") {
            categoryNum++;
            textToShare += categoryNum + ". Sites Internet<br>" + arr_internet;
        }

        if (arr_cd != "" && arr_movie != "") {
            categoryNum++;
            textToShare += categoryNum + ". Documents audiovisuels<br>" + arr_cd + arr_movie;
        } else if (arr_movie != "") {
            categoryNum++;
            textToShare += categoryNum + ". Documents audiovisuels<br>" + arr_movie;
        } else if (arr_cd != "") {
            categoryNum++;
            textToShare += categoryNum + ". Documents audiovisuels<br>" + arr_cd;
        }

        if (arr_interview != "") {
            categoryNum++;
            textToShare += categoryNum + ". Entrevues<br>" + arr_interview;
        }

        if (errNum > 0) {
            $translate(["PROJECT.DETAIL.POPUP.ERRORS_SOURCES", "PROJECT.DETAIL.POPUP.SHARE_TEXT", "PROJECT.DETAIL.POPUP.SHARE", "PROJECT.DETAIL.POPUP.CANCEL"], { errNum:errNum }).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations["PROJECT.DETAIL.POPUP.SHARE_TEXT"],
                    template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.ERRORS_SOURCES"] + '</p>',
                    cancelText: translations["PROJECT.DETAIL.POPUP.CANCEL"],
                    okText: '<b>' + translations["PROJECT.DETAIL.POPUP.SHARE"] + '</b>'
                }).then(function(res) {
                    if (res) {
                        if (!!window.cordova) {
                            window.plugins.socialsharing.shareViaEmail(
                                textToShare,
                                $scope.project.name, [], // TO: must be null or an array
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
                        }else {
                           $ionicPopup.alert({
                             title: $scope.project.name,
                             template: '<div class="interact">' + textToShare + "</div>"
                           });
                        }
                    } else {
                        console.log("Cancelled by user");
                    }
                });
            });
        }else {
            if (!!window.cordova) {
                window.plugins.socialsharing.shareViaEmail(
                    textToShare,
                    $scope.project.name, [], // TO: must be null or an array
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
            }else {
               $ionicPopup.alert({
                 title: $scope.project.name,
                 template: '<div class="interact">' + textToShare + "</div>"
               });
            }
        }
    }

    // Submit
    $scope.submitSource = function() {
        if ($scope.newsource.type == "interview" && $scope.newsource.author1lastname && $scope.newsource.author1firstname && Settings.get("firstName") == "") {
            $translate(["PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME", "PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME", "YES", "NO"]).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations["PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME"],
                    template: "<p class='center'>" + translations["PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME"] + "</p>",
                    okText: translations["YES"],
                    cancelText: translations["NO"]
                }).then(function(res) {
                    if(res) {
                        Settings.set("firstName", $scope.newsource.author1firstname);
                        Settings.set("lastName", $scope.newsource.author1lastname);
                    }
                    var creatingProj = ParseSource.parseSource($scope.newsource);
                    creatingProj.project_id = $stateParams.projectID;
                    // Save to db
                    Storage.createSource(creatingProj).then(function(response) {
                        creatingProj._id = response.id;
                        creatingProj._rev = response.rev;
                        $scope.project.sources.push(creatingProj);
                        $scope.project.sources.sort(function(a, b) {
                            if (a.title && b.title) {
                                return a.title.localeCompare(b.title);
                            } else if (a.title) {
                                return a.title.localeCompare(b.parsedSource);
                            } else if (b.title) {
                                return a.parsedSource.localeCompare(b.title);
                            }
                        });
                        $scope.closeModal();
                    });
                });
            });
        } else {
           var creatingProj = ParseSource.parseSource($scope.newsource);
           creatingProj.project_id = $stateParams.projectID;
           // Save to db
           Storage.createSource(creatingProj).then(function(response) {
               creatingProj._id = response.id;
               creatingProj._rev = response.rev;
               $scope.project.sources.push(creatingProj);
               $scope.project.sources.sort(function(a, b) {
                   if (a.title && b.title) {
                       return a.title.localeCompare(b.title);
                   } else if (a.title) {
                       return a.title.localeCompare(b.parsedSource);
                   } else if (b.title) {
                       return a.parsedSource.localeCompare(b.title);
                   }
               });
               $scope.closeModal();
           });
        }

    }

    // Delete
    $scope.deleteSource = function(id) {
        // Delete the source
        $translate(["PROJECT.DETAIL.POPUP.DELETE_TITLE", "PROJECT.DETAIL.POPUP.DELETE_TEXT", "PROJECT.DETAIL.POPUP.DELETE", "PROJECT.DETAIL.POPUP.CANCEL"]).then(function (translations) {
            $ionicPopup.confirm({
                title: translations["PROJECT.DETAIL.POPUP.DELETE_TITLE"],
                template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.DELETE_TEXT"] + '</p>',
                cancelText: translations["PROJECT.DETAIL.POPUP.CANCEL"],
                okText: '<b>' + translations["PROJECT.DETAIL.POPUP.DELETE"] + '</b>',
                okType: 'button-assertive',
                cssClass: 'deleteProject'
            }).then(function(res) {
                if (res) {
                    Storage.deleteSource(id).then(function(result) {
                        $scope.removeAnimate = true;
                        $timeout(function () {
                            for (var i = 0; i < $scope.project.sources.length; i++) {
                                if ($scope.project.sources[i]._id == id) {
                                    $scope.project.sources.splice(i, 1);
                                    $scope.removeAnimate = false;
                                    setTimeout(function () {
                                        $ionicScrollDelegate.resize();
                                    }, 400);
                                }
                            }
                        });
                    });
                } else {
                    $ionicListDelegate.closeOptionButtons();
                }
            });
        });
    }

    // Scan
    $scope.fetchFromISBNdb = function(inputISBN) {
        if (navigator.onLine) {
            Fetch.fromISBNdb(inputISBN).then(function (response) {
                if ($scope.isNewSourceEmpty(true)) {
                    $scope.newsource.author1firstname = response.author1firstname;
                    $scope.newsource.author1lastname = response.author1lastname;
                    $scope.newsource.author2firstname = response.author2firstname;
                    $scope.newsource.author2lastname = response.author2lastname;
                    $scope.newsource.author3firstname = response.author3firstname;
                    $scope.newsource.author3lastname = response.author3lastname;
                    $scope.newsource.hasAuthors = response.hasAuthors;
                    $scope.newsource.title = response.title;
                    $scope.newsource.editor = response.editor;
                    $scope.newsource.publicationDate = response.publicationDate;
                    $scope.newsource.publicationLocation = response.publicationLocation;
                    $scope.newsource.pageNumber = response.pageNumber;
                    $scope.insertingFromScan = true;
                }else {
                    $translate(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "PROJECT.DETAIL.POPUP.CANCEL"]).then(function (translations) {
                        $ionicPopup.confirm({
                            title: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE"],
                            template: "<p class='center'>" + translations["PROJECT.DETAIL.POPUP.AUTO_FILL_DESC"] + "</p>",
                            okText: translations["PROJECT.DETAIL.POPUP.OVERWRITE"],
                            okType: "button-assertive",
                            cancelText: translations["PROJECT.DETAIL.POPUP.CANCEL"]
                        }).then(function(res) {
                            if(res) {
                                $scope.newsource.author1firstname = response.author1firstname;
                                $scope.newsource.author1lastname = response.author1lastname;
                                $scope.newsource.author2firstname = response.author2firstname;
                                $scope.newsource.author2lastname = response.author2lastname;
                                $scope.newsource.author3firstname = response.author3firstname;
                                $scope.newsource.author3lastname = response.author3lastname;
                                $scope.newsource.hasAuthors = response.hasAuthors;
                                $scope.newsource.title = response.title;
                                $scope.newsource.editor = response.editor;
                                $scope.newsource.publicationDate = response.publicationDate;
                                $scope.newsource.publicationLocation = response.publicationLocation;
                                $scope.newsource.pageNumber = response.pageNumber;
                                $scope.insertingFromScan = true;
                            }
                        });
                    });
                }
            }).catch(function (response) {
                if (response == 404) {
                    $translate(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT"]).then(function (translations) {
                        $ionicPopup.alert({
                            title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
                            template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT"] + '</p>'
                        });
                    });
                }else if (response == 408) {
                    $translate(["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE", "PROJECT.DETAIL.POPUP.TIMEOUT_TEXT", "PROJECT.DETAIL.POPUP.ADD", "PROJECT.DETAIL.POPUP.RETRY"]).then(function (translations) {
                        $ionicPopup.confirm({
                            title: translations["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE"],
                            template: "<p class='center'>" + translations["PROJECT.DETAIL.POPUP.TIMEOUT_TEXT"] + "</p>",
                            okText: translations["PROJECT.DETAIL.POPUP.ADD"],
                            okType: "button-positive",
                            cancelText: translations["PROJECT.DETAIL.POPUP.RETRY"],
                            cancelType: "button-balanced button-outline"
                        }).then(function(res) {
                            if (res) {
                                var creating = {
                                    isbn: inputISBN,
                                    date: moment().toObject(),
                                    project_id: $scope.project.id
                                };

                                Storage.createPending(creating).then(function(responseRepo) {
                                    $scope.project.pendings++;
                                });

                                $scope.newSourceModal.hide();
                            } else {
                                $scope.fetchFromISBNdb(inputISBN);
                            }
                        });
                    });
                }else if (response >= 500 && response <= 599) {
                    $translate(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500"]).then(function (translations) {
                        $ionicPopup.alert({
                            title: translations["PROJECT.DETAIL.POPUP.ERROR"],
                            template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.ERROR_500"] + '</p>'
                        });
                    });
                }else {
                    ReportUser.report(response);
                }
            });
        } else {
            $translate(["PROJECT.DETAIL.POPUP.NO_CONNECTION", "PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS", "PROJECT.DETAIL.POPUP.RETRY", "PROJECT.DETAIL.POPUP.ADD"]).then(function (translations) {
                $ionicPopup.confirm({
                    title: translations["PROJECT.DETAIL.POPUP.NO_CONNECTION"],
                    template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS"] + '</p>',
                    okText: translations["PROJECT.DETAIL.POPUP.ADD"],
                    okType: "button-positive",
                    cancelText: translations["PROJECT.DETAIL.POPUP.RETRY"],
                    cancelType: "button-outline button-balanced"
                }).then(function(res) {
                    if (res) {
                        var creating = {
                            isbn: inputISBN,
                            date: moment().toObject(),
                            project_id: $scope.project.id
                        };

                        Storage.createPending(creating).then(function(responseRepo) {
                            $scope.project.pendings++;
                        });

                        $scope.newSourceModal.hide();
                    } else {
                        $scope.fetchFromISBNdb(inputISBN);
                    }
                });
            });
        }
    }

    $scope.scanBook = function() {
        // If boarding
        if (!Settings.get("scanBoardingDone")) {
            $scope.scanBoardingModal.show();
            $scope.boardingIndex = 0;
            return;
        } else {
            $scope.newsource.type = "book";
        }
        // If running
        if ($scope.currentlyScanning === true) {
            return;
        }
        else if (ionic.Platform.platforms.indexOf("browser") !== -1) {
            return;
        }
        else {
            $scope.currentlyScanning = true;
        }
        $ionicBackdrop.retain();
        cordova.plugins.barcodeScanner.scan(
            function(result) {
                $ionicBackdrop.release();
                $scope.currentlyScanning = false;
                $scope.$apply();
                if (!result.cancelled) {
                    if (result.format == "EAN_13") {
                        $scope.fetchFromISBNdb(result.text);
                    } else {
                        $translate(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE"]).then(function (translations) {
                            $ionicPopup.alert({
                                title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
                                template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE"] + '</p>'
                            });
                        });
                    }
                }
            },
            function(error) {
                $ionicBackdrop.release();
                $scope.currentlyScanning = false;
                $translate(["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN", "PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT"]).then(function (translations) {
                    $ionicPopup.alert({
                        title: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN"],
                        template: '<p class="center">' + translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT"] + '</p>'
                    });
                });
            }
        );
    }

    // Event handlers
    $scope.$on("$ionicView.enter", function() {
        if ($scope.refreshSources) {
            $scope.loadSources();
        }

        if ($scope.refreshPending) {
            $scope.loadSources();
            $scope.loadPendings();
        }

        $scope.isAdvanced = Settings.get("advanced");
    });

    $scope.$on('modal.hidden', function() {
        $scope.resetModalVars();
    });

    // Go to other view
    $scope.openSourceDetail = function(id) {
        $state.go('tab.source-detail', {
            projectID: $scope.project.id,
            sourceID: id
        });
        $scope.refreshSources = true;
    }

    $scope.openPendings = function() {
        $scope.refreshPending = true;
        $state.go('tab.pending', {
            projectID: $scope.project.id
        });
    }

    if ($stateParams.newSource) {
        $scope.addSource();
    }
});
