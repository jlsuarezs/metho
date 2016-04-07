angular.module('metho.controllers.projects', [])

// Project tab view
.controller('ProjectsCtrl', function($scope, $ionicModal, $ionicPlatform, $ionicPopup, $ionicListDelegate, ShareProject, $state) {
    $scope.projects = [];
    $scope.project = { name:"", matter:"" };
    $scope.editingProject = {};
    $scope.err = "";
    $scope.errorName = false;
    $scope.loading = true;
    // Initialize the DB
    $scope.projectsRepo = new PouchDB("projects");
    // Load the projects
    $scope.projectsRepo.allDocs({include_docs:true}).then(function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            var obj = {
                name: result.rows[i].doc.name,
                matter: result.rows[i].doc.matter,
                id: result.rows[i].doc._id
            }
            $scope.projects.push(obj);
        }
        $scope.loading = false;
        $scope.$apply();
    }).catch(function (err) {
        console.log(err);
    });

    $ionicModal.fromTemplateUrl('templates/modal_new_project.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newProjectModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modal_edit_project.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.editProjectModal = modal;
    });

    $scope.closeModal = function () {
        $scope.newProjectModal.hide();
        $scope.errorName = false;
    }

    $scope.closeEditModal = function () {
        $scope.editProjectModal.hide();
        $scope.errorName = false;
    }

    $scope.newProject = function () {
        $scope.newProjectModal.show();
    }

    $scope.submitProject = function () {
        if ($scope.project.name == "" || $scope.project.name == null) {
            $scope.errorName = true;
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: '<p class="center">Entrez un nom de projet</p>'
            });
        }else {
            $scope.errorName = false;
            if ($scope.project.matter == "" || $scope.project.matter == null) {
                var theMatter = "Matière inconnue";
            }else {
                var theMatter = $scope.project.matter;
            }
            var creatingProj = {
                name: $scope.project.name,
                matter: theMatter
            };

            $scope.projectsRepo.post(creatingProj).then(function (response) {
                creatingProj.id = response.id;
                $scope.projects.push(creatingProj);
                $scope.project = {name:"", matter:""};
                $scope.newProjectModal.hide();
                $scope.$apply();
            }).catch(function (err) {
                console.log(err);
            });
        }
    }

    $scope.deleteProject = function (id) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Voulez-vous supprimer ce projet ?',
          template: '<p class="center">La suppression de ce projet entrainera la perte de toutes les sources contenues dans celui-ci. Cette action est irréversible.</p>',
          cancelText: 'Annuler',
          okText: '<b>Supprimer</b>',
          okType: 'button-assertive',
          cssClass: 'deleteProject'
        });
        confirmPopup.then(function(res) {
          if(res) {
              $scope.projectsRepo.get(id).then(function(doc) {
                return $scope.projectsRepo.remove(doc);
              }).then(function (result) {
                  for (var i = 0; i < $scope.projects.length; i++) {
                      if ($scope.projects[i].id == result.id) {
                          $scope.projects.splice(i, 1);
                          $scope.$apply();
                          return;
                      }
                  }
              }).catch(function (err) {
                console.log(err);
              });
          } else {
            $ionicListDelegate.closeOptionButtons();
          }
        });

    }

    $scope.editProject = function (id) {
        $scope.editingProject = {};
        $scope.projectsRepo.get(id).then(function(doc) {
            $scope.editingProject.name = doc.name;
            if (doc.matter == "Matière inconnue") {
                $scope.editingProject.matter = "";
            }else {
                $scope.editingProject.matter = doc.matter;
            }
            $scope.editingProject.id = doc._id;
        });
        $scope.editProjectModal.show();
    }

    $scope.submitEditProject = function () {
        if ($scope.editingProject.name == "") {
            $scope.errorName = true;
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: 'Le projet doit avoir un nom.'
            });
        }else {
            // make the change in the database
            $scope.projectsRepo.get($scope.editingProject.id).then(function(doc) {
                return $scope.projectsRepo.put($scope.editingProject, $scope.editingProject.id, doc._rev);
            }).then(function(response) {
                // edit the table's entry
                for (var i = 0; i < $scope.projects.length; i++) {
                    if ($scope.projects[i].id == response.id) {
                        $scope.projects[i].name = $scope.editingProject.name;
                        if ($scope.editingProject.matter == "") {
                            $scope.projects[i].matter = "Matière inconnue";
                        }else {
                            $scope.projects[i].matter = $scope.editingProject.matter;
                        }
                    }
                }
            }).catch(function (err) {
              console.log(err);
            });
            $scope.editProjectModal.hide();
            $ionicListDelegate.closeOptionButtons();
        }
    }

    $scope.openProjectDetail = function (id) {
        for (var i = 0; i < $scope.projects.length; i++) {
            if ($scope.projects[i].id == id) {
                var index = i;
                break;
            }
        }
        ShareProject.setName($scope.projects[index].name);
        ShareProject.setMatter($scope.projects[index].matter);
        $state.go("tab.project-detail",{projectID:id});
    }
})


// Project detail view
.controller('ProjectDetailCtrl', function($scope, $stateParams, $ionicModal, $ionicPopup, $ionicScrollDelegate, $parseSource, ShareProject, ShareSource, $state, $ionicListDelegate, $ionicActionSheet, $http, $ionicLoading, SharePendings, $ionicSlideBoxDelegate, Settings, $ionicBackdrop) {
    $scope.projectRepo = new PouchDB("projects");
    $scope.sourceRepo = new PouchDB("sources");
    $scope.pendingRepo = new PouchDB("pendings");
    $scope.project = {
        name: ShareProject.getName(),
        id: $stateParams.projectID,
        matter: ShareProject.getMatter(),
        sources: [],
        pendings: []
    };
    $scope.loading = true;
    $scope.newsource = {};
    $scope.newsource.consultationDate = new Date();
    $scope.refreshID = null;
    $scope.refreshIndex = null;
    $scope.removeAnimate = false;
    $scope.refreshPending = false;

    $ionicModal.fromTemplateUrl('templates/modal_new_source.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newSourceModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modal_scan_boarding.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.scanBoardingModal = modal;
    });

    $scope.closeBoarding = function () {
        $scope.scanBoardingModal.hide();
        Settings.set("scanBoardingDone", true);
        $scope.scanBook();
    }

    $scope.slideHasChanged = function (index) {
        $scope.boardingIndex = index;
    }

    $scope.nextSlideBoarding = function () {
        $ionicSlideBoxDelegate.next();
    }

    $scope.lastSlideBoarding = function () {
        $ionicSlideBoxDelegate.previous();
    }

    $scope.share = function () {
        var textToShare = "Voici les sources du projet « " + $scope.project.name + " » : <br><br>";
        var errNum = 0;
        if (Settings.get("askForOrder")) {
            var cancel = Settings.get("defaultOrder") == "alpha" ? "button-positive" : "button-stable";
            var ok = Settings.get("defaultOrder") == "type" ? "button-positive" : "button-stable";
            // display modal
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Triage',
                 subTitle: 'Ordre de triage',
                 cssClass: "popup-vertical-buttons",
                 cancelText: "Alphabétique",
                 cancelType: cancel,
                 okText: "Type",
                 okType: ok
               });
               confirmPopup.then(function(res) {
                    if(!res) { // Ordre alphabétique
                       var arr_sources = JSON.parse(JSON.stringify($scope.project.sources)).sort(function (a, b) {
                           return a.parsedSource.localeCompare(b.parsedSource);
                       });
                       for (var i = 0; i < arr_sources.length; i++) {
                           textToShare += arr_sources[i].parsedSource + "<br><br>";
                           errNum += arr_sources[i].errors.length;
                       }

                       if (errNum > 0) {
                           var confirmPopup = $ionicPopup.confirm({
                               title: 'Erreur',
                               template: '<p class="center">Les sources que vous essayez de partager contiennent <strong>' + errNum + '</strong> erreur(s). Voulez-vous les partager quand même?</p>',
                               cancelText: 'Annuler',
                               okText: '<b>Partager</b>'
                           });
                           confirmPopup.then(function(res) {
                               if(res) {
                                   window.plugins.socialsharing.shareViaEmail(
                                     textToShare,
                                     $scope.project.name,
                                     [], // TO: must be null or an array
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
                               } else {
                                   console.log("Cancelled by user");
                               }
                           });
                       }else {
                           window.plugins.socialsharing.shareViaEmail(
                             textToShare,
                             $scope.project.name,
                             [], // TO: must be null or an array
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
                       }
                    } else { // Type d'ouvrage
                        var arr_sources = JSON.parse(JSON.stringify($scope.project.sources)).sort(function (a, b) {
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
                        }else if (arr_movie != "") {
                            categoryNum++;
                            textToShare += categoryNum + ". Documents audiovisuels<br>" + arr_movie;
                        }else if (arr_cd != "") {
                            categoryNum++;
                            textToShare += categoryNum + ". Documents audiovisuels<br>" + arr_cd;
                        }

                        if (arr_interview != "") {
                            categoryNum++;
                            textToShare += categoryNum + ". Entrevues<br>" + arr_interview;
                        }
                        
                        window.plugins.socialsharing.shareViaEmail(
                          textToShare,
                          $scope.project.name,
                          [], // TO: must be null or an array
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
                    }
               });
        }else if (Settings.get("defaultOrder") == "alpha") {
            var arr_sources = JSON.parse(JSON.stringify($scope.project.sources)).sort(function (a, b) {
                return a.parsedSource.localeCompare(b.parsedSource);
            });
            for (var i = 0; i < arr_sources.length; i++) {
                textToShare += arr_sources[i].parsedSource + "<br><br>";
                errNum += arr_sources[i].errors.length;
            }

            if (errNum > 0) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Erreur',
                    template: '<p class="center">Les sources que vous essayez de partager contiennent <strong>' + errNum + '</strong> erreur(s). Voulez-vous les partager quand même?</p>',
                    cancelText: 'Annuler',
                    okText: '<b>Partager</b>'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        window.plugins.socialsharing.shareViaEmail(
                          textToShare,
                          $scope.project.name,
                          [], // TO: must be null or an array
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
                    } else {
                        console.log("Cancelled by user");
                    }
                });
            }else {
                window.plugins.socialsharing.shareViaEmail(
                  textToShare,
                  $scope.project.name,
                  [], // TO: must be null or an array
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
            }
        }else { // defaultOrder == type

        }
    }

    $scope.resetModalVars = function () {
        // Reset vars
        $scope.newsource = {};
        $scope.newsource.consultationDate = new Date();
    }

    $scope.refreshModalScroll = function () {
        $ionicScrollDelegate.resize();
    }

    $scope.refreshModalScrollWithDelay = function () {
        setTimeout(function () {
            $ionicScrollDelegate.resize();
        }, 1000);
    }

    $scope.autoCompleteEditor = function () {
        if ($scope.newsource.type == "internet") {
            switch ($scope.newsource.editor.toLowerCase()) {
                case "wikipédia, l'encyclopédie libre":
                case "wikipédia l'encyclopédie libre":
                case "wikipedia, l'encyclopédie libre":
                case "wikipedia l'encyclopédie libre":
                    $scope.newsource.url = "https://www.fr.wikipedia.org";
                    $scope.newsource.editor = "Wikipédia, l'encyclopédie libre";
                    break;
                case "wikipedia the free encyclopedia":
                case "wikipedia, the free encyclopedia":
                    $scope.newsource.url = "https://www.en.wikipedia.org";
                    $scope.newsource.editor = "Wikipedia, the free encyclopedia";
                    break;
                default:
                    $scope.newsource.url = "";
            }
        }
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

    $scope.addSource = function () {
        // Open modal
        var hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: 'Livre' },
            { text: 'Article de périodique' },
            { text: 'Site Internet' },
            { text: 'Cédérom (CD)' },
            { text: 'Document audiovisuel' },
            { text: 'Entrevue' }
          ],
          titleText: 'Choisir le type de source',
          cancelText: 'Annuler',
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
                    break;
                default:

            }
            if (!!window.cordova) {
                cordova.plugins.Keyboard.disableScroll(true);
            }
            $scope.newSourceModal.show();
            return true;
          }
        });
    }

    $scope.closeModal = function () {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
    }

    $scope.$on('modal.hidden', function() {
        $scope.resetModalVars();
    });

    $scope.submitSource = function () {
        if ($scope.newsource.type != "" && $scope.newsource.type != null) {
            var creatingProj = $parseSource.parseSource($scope.newsource);
            creatingProj.project_id = $stateParams.projectID;
            // Save to db
            $scope.sourceRepo.post(creatingProj).then(function (response) {
                creatingProj._id = response.id;
                creatingProj._rev = response.rev;
                $scope.project.sources.push(creatingProj);
                $scope.closeModal();
                $scope.$apply();
            }).catch(function (err) {
                console.log(err);
            });
        }else {
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: '<p class="center">La source doit avoir un type</p>'
            });
            return;
        }
    }

    $scope.deleteSource = function (id) {
        // Delete the source
        var confirmPopup = $ionicPopup.confirm({
          title: 'Voulez-vous supprimer cet source ?',
          template: '<p class="center">La suppression de cette source entrainera la perte de toutes les données ratachées à celle-ci. Cette action est irréversible.</p>',
          cancelText: 'Annuler',
          okText: '<b>Supprimer</b>',
          okType: 'button-assertive',
          cssClass: 'deleteProject'
        });
        confirmPopup.then(function(res) {
          if(res) {
              $scope.sourceRepo.get(id).then(function(doc) {
                return $scope.sourceRepo.remove(doc);
              }).then(function (result) {
                  $scope.removeAnimate = true;
                  $scope.$apply();
                  for (var i = 0; i < $scope.project.sources.length; i++) {
                      if ($scope.project.sources[i]._id == result.id) {
                          $scope.project.sources.splice(i, 1);
                          $scope.$apply();
                          $scope.removeAnimate = false;
                          $scope.$apply();
                          return;
                      }
                  }

              }).catch(function (err) {
                console.log(err);
              });
          } else {
            $ionicListDelegate.closeOptionButtons();
          }
        });
    }

    $scope.fetchFromISBNdb = function (inputISBN) {
        if (navigator.onLine) {
            var loading = $ionicLoading.show({
              template: '<ion-spinner></ion-spinner>'
            });
            $http({ method:"GET", url:"http://isbndb.com/api/v2/json/YVFT6RLV/book/"+inputISBN})
            .then(function (response) { // Success
                // alert(JSON.stringify(response));
                if (!!response.data.error) {
                    loading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Livre introuvable',
                        template: '<p class="center">Le code barre a bien été balayé, mais ce livre ne semble pas faire partie de notre base de données. </p>'
                    });
                }else {
                    // Titre
                    $scope.newsource.title = response.data.data[0].title;
                    // Publisher/Editor
                    $scope.newsource.editor = response.data.data[0].publisher_name;
                    // Date de publication
                    if (!!response.data.data[0].edition_info && response.data.data[0].edition_info.match(/[0-9]{4}/)) {
                        var working_on_date = response.data.data[0].edition_info.match(/[0-9]{4}/);
                        $scope.newsource.publicationDate = response.data.data[0].edition_info.match(/[0-9]{4}/);
                    }else if (!!response.data.data[0].publisher_text && response.data.data[0].publisher_text.match(/[0-9]{4}/)) {
                        var working_on_date = response.data.data[0].publisher_text.match(/[0-9]{4}/);
                        $scope.newsource.publicationDate = response.data.data[0].publisher_text.match(/[0-9]{4}/);
                    }else {
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
                        }else if (arr_pages.indexOf("pages") != -1) {
                            var indexOfPages = arr_pages.indexOf("pages") - 1;
                            $scope.newsource.pageNumber = arr_pages[indexOfPages];
                        }
                    }

                    // Auteur
                    if (response.data.data[0].author_data.length) {
                        for (var i = 0; i < response.data.data[0].author_data.length; i++) {
                            $scope.newsource["author" + String(i+1) + "lastname"] = response.data.data[0].author_data[i].name.split(",")[0];
                            $scope.newsource["author" + String(i+1) + "firstname"] = response.data.data[0].author_data[i].name.split(",")[1];
                        }
                        var authorNum = response.data.data[0].author_data.length;
                        if (authorNum >= 1 && authorNum <= 3) {
                            $scope.newsource.hasAuthors = "13";
                        }else if (authorNum > 3) {
                            $scope.newsource.hasAuthors = "more3";
                        }
                    }

                    loading.hide();
                }
            }, function (response) { // Failure
                if (response.status == 408) {
                    loading.hide();
                    var alertPopup = $ionicPopup.confirm({
                        title: 'Erreur',
                        template: "<p class='center'>Le temps d'attente est écoulé. Vous vous trouvez probablement sur un réseau lent. Voulez-vous ajouter ce code-barre dans la liste d'attente ou réessayer ?</p>",
                        okText: "Ajouter",
                        okType: "button-positive",
                        cancelText: "Réessayer",
                        cancelType: "button-balanced button-outline"
                    });
                    alertPopup.then(function (res) {
                        if (res) {
                            var creating = { isbn:inputISBN, date:new Date().toLocaleDateString()};
                            $scope.pendingRepo.post(creating).then(function (responseRepo) {
                                creating._id = responseRepo.id;
                                creating._rev = responseRepo.rev;
                                $scope.project.pendings.push(creating);
                            });
                            $scope.newSourceModal.hide();
                        }else {
                            $scope.fetchFromISBNdb(inputISBN);
                        }
                    });
                }
            });
        }else {
            var alertPopup = $ionicPopup.confirm({
                title: 'Aucune connexion',
                template: '<p class="center">Voulez-vous ajouter ce code barre à la liste d\'attente ?</p>',
                okText: "Ajouter",
                okType: "button-positive",
                cancelText: "Réessayer",
                cancelType: "button-outline button-balanced"
            });
            alertPopup.then(function (res) {
                if (res) {
                    var creating = { isbn:inputISBN, date:new Date().toLocaleDateString(), project_id:$stateParams.projectID};
                    $scope.pendingRepo.post(creating).then(function (responseRepo) {
                        creating._id = responseRepo.id;
                        creating._rev = responseRepo.rev;
                        $scope.project.pendings.push(creating);
                    });
                    $scope.newSourceModal.hide();
                }else {
                    $scope.fetchFromISBNdb(inputISBN);
                }
            });
        }
    }

    $scope.scanBook = function () {
        if (!Settings.get("scanBoardingDone")) {
            $scope.scanBoardingModal.show();
            $scope.boardingIndex = 0;
            return;
        }else {
            $scope.newsource.type = "book";
        }
        $ionicBackdrop.retain();
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                $ionicBackdrop.release();
                if (!result.cancelled) {
                    if (result.format == "EAN_13") {
                        $scope.fetchFromISBNdb(result.text);
                    }else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Livre introuvable',
                            template: '<p class="center">Le code barre a été balayé, mais ce type de code barre n\'est pas un code barre de livre. Le bon code barre possède habituellement une inscription ISBN par dessus celui-ci. Si deux code barre sont côte à côte, le mauvais a peut-être été balayé. Vous pouvez réessayer.</p>'
                        });
                    }
                }
            },
            function (error) {
                $ionicBackdrop.release();
                console.log("Scanning failed: " + error);
            }
        );
    }
    // Initialize

    $scope.analyseItemsInfo = function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            if (result.rows[i].doc.project_id == $stateParams.projectID) {
                $scope.project.sources.push(result.rows[i].doc);
            }
        }
        $scope.loading = false;
    }

    $scope.analysePendings = function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            if (result.rows[i].doc.project_id == $stateParams.projectID) {
                $scope.project.pendings.push(result.rows[i].doc);
            }
        }
    }

    $scope.sourceRepo.allDocs({ include_docs: true }).then($scope.analyseItemsInfo);
    $scope.pendingRepo.allDocs({ include_docs: true }).then($scope.analysePendings);

    $scope.$on("$ionicView.afterEnter", function () {
        if ($scope.refreshID != null) {
            $scope.sourceRepo.get($scope.refreshID).then(function (result) {
                $scope.project.sources[$scope.refreshIndex] = result;
            });
        }

        if ($scope.refreshPending) {
            $scope.project.pendings = SharePendings.getPendings();
            $scope.project.sources = $scope.project.sources.concat(SharePendings.getSources());
        }
    });

    $scope.openSourceDetail = function (id) {
        for (var i = 0; i < $scope.project.sources.length; i++) {
            if ($scope.project.sources[i]._id == id) {
                var index = i;
                break;
            }
        }
        ShareSource.setSource($scope.project.sources[index]);
        $state.go('tab.source-detail', {projectID:$stateParams.projectID, sourceID:id});
        $scope.refreshID = id;
        $scope.refreshIndex = index;
    }

    $scope.openPendings = function () {
        SharePendings.setPendings($scope.project.pendings);
        $scope.refreshPending = true;
        $state.go('tab.pending', {projectID:$scope.project.id});
    }
})


// Source detail view
.controller('SourceDetailCtrl', function ($scope, $stateParams, $ionicPopup, $parseSource, $ionicModal, ShareSource) {
    $scope.source = ShareSource.getSource();
    $scope.loading = false;
    $scope.sourceRepo = new PouchDB("sources");
    $scope.projectRepo = new PouchDB("projects");

    $ionicModal.fromTemplateUrl('templates/modal_edit_source.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.editSourceModal = modal;
    });

    $scope.solveError = function (id) {
        cordova.plugins.Keyboard.disableScroll(false);
        if ($scope.source.errors[id].complex) {
            $ionicPopup.prompt({
                title: $scope.source.errors[id].promptTitle,
                subTitle: $scope.source.errors[id].promptText,
                template: $scope.source.errors[id].template,
                inputType: 'text',
                cancelText: "Annuler",
                okText: "<b>Confirmer</b>"
            }).then(function(res) {
                if (res != null) {
                    var e = document.getElementById($scope.source.errors[id].id);
                    switch ($scope.source.errors[id].type) {
                        case "select":
                            $scope.source[$scope.source.errors[id].var] = e.options[e.selectedIndex].value;
                            break;
                        case "input":
                            $scope.source[$scope.source.errors[id].var] = e.value;
                            break;
                        default:

                    }
                    $scope.source = $parseSource.parseSource($scope.source);
                    $scope.sourceRepo.put($scope.source, $scope.source._id, $scope.source._rev).then(function (response) {
                        if (response.ok) {
                            $scope.source._rev = response.rev;
                        }else {
                            console.log("not ok");
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            });
        }else {
            $ionicPopup.prompt({
                title: $scope.source.errors[id].promptTitle,
                subTitle: $scope.source.errors[id].promptText,
                inputType: 'text',
                cancelText: "Annuler",
                okText: "<b>Confirmer</b>"
            }).then(function(res) {
                if (res != null) {
                    $scope.source[$scope.source.errors[id].var] = res;
                    $scope.source = $parseSource.parseSource($scope.source);
                    $scope.sourceRepo.put($scope.source, $scope.source._id, $scope.source._rev).then(function (response) {
                        if (response.ok) {
                            $scope.source._rev = response.rev;
                        }else {
                            console.log("not ok");
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            });
        }

    }

    $scope.solveWarning = function (id) {
        cordova.plugins.Keyboard.disableScroll(false);
        $ionicPopup.prompt({
            title: $scope.source.warnings[id].promptTitle,
            subTitle: $scope.source.warnings[id].promptText,
            inputType: 'text',
            cancelText: "Annuler",
            okText: "<b>Confirmer</b>"
        }).then(function(res) {
            if (res != null) {
                $scope.source[$scope.source.warnings[id].var] = res;
                $scope.source = $parseSource.parseSource($scope.source);
                $scope.sourceRepo.put($scope.source, $scope.source._id, $scope.source._rev).then(function (response) {
                    if (response.ok) {
                        $scope.source._rev = response.rev;
                    }else {
                        console.log("not ok");
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            }
        });
    }

    $scope.edit = function () {
        cordova.plugins.Keyboard.disableScroll(true);
        $scope.newsource = JSON.parse(JSON.stringify($scope.source));
        if ($scope.newsource.consultationDate != null && $scope.newsource.consultationDate != "") {
            $scope.newsource.consultationDate = new Date($scope.newsource.consultationDate);
        }
        $scope.editSourceModal.show();
    }

    $scope.cancelEdit = function () {
        $scope.newsource = {};
        $scope.editSourceModal.hide();
    }

    $scope.submitEdit = function () {
        $scope.source = $parseSource.parseSource($scope.newsource);
        $scope.editSourceModal.hide();
        $scope.newsource = {};
        $scope.sourceRepo.put($scope.source, $scope.source._id, $scope.source._rev).then(function (response) {
            if (response.ok) {
                $scope.source._rev = response.rev;
            }else {
                console.log("not ok");
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    // Init if service is unavailable (debug when reloading the page)
    if ($scope.source == null) {
        $scope.loading = true;
        $scope.sourceRepo.get($stateParams.sourceID).then(function (result) {
            $scope.source = result;
            $scope.loading = false;
        });
    }
})

.controller("PendingCtrl", function ($scope, $stateParams, SharePendings, $ionicModal, $ionicPopup, $ionicScrollDelegate, $ionicLoading, $http, $parseSource, $state) {
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

    $scope.$on("$ionicView.beforeLeave", function () {
        SharePendings.setSources($scope.project.sources);
        SharePendings.setPendings($scope.pendings);
    });

    $scope.openAtURL = function (url) {
        SafariViewController.isAvailable(function (available) {
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

    $scope.downloadDetails = function (index, isbn, id) {
        $scope.newsource.type = "book";
        $scope.newSourceModal.show();
        if ($scope.pendings[index].not_available) {
            $scope.newsource.not_available = true;
            $scope.openAtURL("http://google.ca/search?q=isbn+"+$scope.pendings[index].isbn);
        }else {
            $scope.fetchFromISBNdb(isbn);
        }
        $scope.editingISBN = isbn;
        $scope.editingIndex = index;
        $scope.editingId = id;
    }

    $scope.openWebBrowser = function () {
        $scope.openAtURL("http://google.ca/search?q=isbn+"+$scope.pendings[$scope.editingIndex].isbn);
    }
    $scope.submitSource = function () {
        if ($scope.newsource.type != "" && $scope.newsource.type != null) {
            var creatingProj = $parseSource.parseSource($scope.newsource);
            creatingProj.project_id = $stateParams.projectID;
            // Save to db
            $scope.sourceRepo.post(creatingProj).then(function (response) {
                creatingProj._id = response.id;
                creatingProj._rev = response.rev;
                $scope.project.sources.push(creatingProj);
                if ($scope.editingId) {
                    $scope.pendings.splice($scope.editingIndex, 1);
                    $scope.pendingRepo.get($scope.editingId).then(function(doc) {
                      return $scope.pendingRepo.remove(doc);
                    }).then(function (result) {
                      // handle result
                    }).catch(function (err) {
                      console.log(err);
                    });
                }
                $scope.editingISBN = null;
                $scope.editingIndex = null;
                $scope.editingId = null;
                if ($scope.pendings.length == 0) {
                    $state.go("tab.project-detail", {projectID:$stateParams.projectID});
                }
                $scope.closeModal();
                $scope.$apply();
            }).catch(function (err) {
                alert(err);
            });
        }else {
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: '<p class="center">La source doit avoir un type.</p>'
            });
            return;
        }
    }

    $scope.closeModal = function () {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
    }

    $scope.resetModalVars = function () {
        // Reset vars
        $scope.newsource = {};
        $scope.newsource.consultationDate = new Date();
    }

    $scope.refreshModalScroll = function () {
        $ionicScrollDelegate.resize();
    }

    $scope.refreshModalScrollWithDelay = function () {
        setTimeout(function () {
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

    $scope.fetchFromISBNdb = function (inputISBN) {
        if (navigator.onLine) {
            var loading = $ionicLoading.show({
              template: '<ion-spinner></ion-spinner>'
            });
            $http({ method:"GET", url:"http://isbndb.com/api/v2/json/YVFT6RLV/book/"+inputISBN})
            .then(function (response) { // Success
                // alert(JSON.stringify(response));
                if (!!response.data.error) {
                    loading.hide();
                    $ionicPopup.confirm({
                        title: 'Livre introuvable',
                        template: '<p class="center">Le code barre a bien été balayé, mais ce livre ne semble pas faire partie de notre base de données. Voulez-vous rechercher les informations sur Internet?</p>',
                        okText:"Rechercher",
                        cancelText:"Plus tard"
                    }).then(function(res) {
                        if(res) {
                            $scope.newsource.not_available = true;
                            $scope.pendings[$scope.editingIndex].not_available = true;
                            $scope.pendingRepo.put($scope.pendings[$scope.editingIndex]);
                            $scope.openAtURL("http://google.ca/search?q=isbn+"+$scope.pendings[$scope.editingIndex].isbn);
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
                }else {
                    // Titre
                    $scope.newsource.title = response.data.data[0].title;
                    // Publisher/Editor
                    $scope.newsource.editor = response.data.data[0].publisher_name;
                    // Date de publication
                    if (!!response.data.data[0].edition_info && response.data.data[0].edition_info.match(/[0-9]{4}/)) {
                        var working_on_date = response.data.data[0].edition_info.match(/[0-9]{4}/);
                        $scope.newsource.publicationDate = response.data.data[0].edition_info.match(/[0-9]{4}/);
                    }else if (!!response.data.data[0].publisher_text && response.data.data[0].publisher_text.match(/[0-9]{4}/)) {
                        var working_on_date = response.data.data[0].publisher_text.match(/[0-9]{4}/);
                        $scope.newsource.publicationDate = response.data.data[0].publisher_text.match(/[0-9]{4}/);
                    }else {
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
                        }else if (arr_pages.indexOf("pages") != -1) {
                            var indexOfPages = arr_pages.indexOf("pages") - 1;
                            $scope.newsource.pageNumber = arr_pages[indexOfPages];
                        }
                    }

                    // Auteur
                    if (response.data.data[0].author_data.length) {
                        for (var i = 0; i < response.data.data[0].author_data.length; i++) {
                            $scope.newsource["author" + String(i+1) + "lastname"] = response.data.data[0].author_data[i].name.split(",")[0];
                            $scope.newsource["author" + String(i+1) + "firstname"] = response.data.data[0].author_data[i].name.split(",")[1];
                        }
                        var authorNum = response.data.data[0].author_data.length;
                        if (authorNum >= 1 && authorNum <= 3) {
                            $scope.newsource.hasAuthors = "13";
                        }else if (authorNum > 3) {
                            $scope.newsource.hasAuthors = "more3";
                        }
                    }

                    loading.hide();
                }
            }, function (response) { // Failure
                if (response.status == 408) {
                    loading.hide();
                    var alertPopup = $ionicPopup.confirm({
                        title: 'Erreur',
                        template: "<p class='center'>Le temps d'attente est écoulé. Vous vous trouvez probablement sur un réseau lent. Voulez-vous réessayer ?</p>",
                        okText: "Réessayer",
                        okType: "button-balanced",
                        cancelText: "Annuler"
                    });
                    alertPopup.then(function (res) {
                        if (res) {
                            $scope.fetchFromISBNdb(inputISBN);
                        }else {
                            $scope.newSourceModal.hide();
                            $scope.newsource = {};
                            $scope.editingId = null;
                            $scope.editingISBN = null;
                            $scope.editingIndex = null;
                        }
                    });
                }
            });
        }else {
            var alertPopup = $ionicPopup.confirm({
                title: 'Aucune connexion',
                template: '<p class="center">Voulez-vous réessayer?</p>',
                okText: "Réessayer",
                okType: "button-balanced",
                cancelText: "Annuler"
            });
            alertPopup.then(function (res) {
                if (res) {
                    $scope.fetchFromISBNdb(inputISBN);
                }else {
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
