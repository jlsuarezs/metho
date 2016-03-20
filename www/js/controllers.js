angular.module('starter.controllers', [])

.controller('ProjectsCtrl', function($scope, $ionicModal, $ionicPlatform, $ionicPopup, $ionicListDelegate) {
    $scope.projects = [];
    $scope.project = { name:"" };
    $scope.editingProject = {};
    $scope.err = "";
    $scope.errorName = false;
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
        if ($scope.project.name == "") {
            $scope.errorName = true;
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: 'Entrez un nom de projet.'
            });
        }else {
            $scope.errorName = false;
            var theMatter = $scope.project.matter != "" ? $scope.project.matter : "Matière inconnue";
            var creatingProj = {
                name: $scope.project.name,
                matter: theMatter
            };

            $scope.projectsRepo.post(creatingProj).then(function (response) {
                creatingProj.id = response.id;
                $scope.projects.push(creatingProj);
                $scope.project = {};
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
            $scope.editingProject.matter = doc.matter;
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
                        $scope.projects[i].matter = $scope.editingProject.matter;
                    }
                }
            }).catch(function (err) {
              console.log(err);
            });
            $scope.editProjectModal.hide();
            $ionicListDelegate.closeOptionButtons();
        }
    }
})






.controller('ProjectDetailCtrl', function($scope, $stateParams, $ionicModal, $ionicPopup, $ionicScrollDelegate) {
    $scope.projectRepo = new PouchDB("projects");
    $scope.sourceRepo = new PouchDB("sources");
    $scope.project = {
        name: "",
        id: "",
        matter: "",
        sources: []
    };
    $scope.newsource = {};

    $ionicModal.fromTemplateUrl('templates/modal_new_source.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newSourceModal = modal;
    });

    $scope.share = function () {
        var textToShare = "";
        for (var i = 0; i < $scope.project.sources.length; i++) {
            textToShare += $scope.project.sources[i].parsedSource + "\n";
        }
        window.plugins.socialsharing.share(text, $scope.project.name);
    }

    $scope.resetModalVars = function () {
        // Reset vars
        $scope.newsource = {};
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
    $scope.$watch("newsource.hasAuthors", $scope.refreshModalScroll);
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

    $scope.addSource = function () {
        // Open modal
        $scope.newSourceModal.show();
    }

    $scope.closeModal = function () {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
    }

    $scope.parseSource = function (sourceToParse) {
        sourceToParse.parsedSource = "";
        switch (sourceToParse.type) {
            case "book":
                sourceToParse.parsedType = "Livre";
                break;
            case "internet":
                sourceToParse.parsedType = "Site web";
                break;
            case "article":
                sourceToParse.parsedType = "Article de périodique";
                break;
            case "cd":
                sourceToParse.parsedType = "Cédérom";
                break;
            case "movie":
                sourceToParse.parsedType = "Document audiovisuel";
                break;
            case "interview":
                sourceToParse.parsedType = "Entrevue";
                break;
            default:

        }
        sourceToParse.errors = [];
        sourceToParse.warnings = [];
        if (sourceToParse.type == "book") {
            if (sourceToParse.hasAuthors == "13") {

                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase() + ", ";
                    }else {
                        sourceToParse.errors.push("Nom du premier auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du premier auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push("Nom et prénom du premier auteur manquants");
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase();
                    }else {
                        sourceToParse.errors.push("Nom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }
                }

                if ((sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) || (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null)) {
                    // Author 3 last name
                    if (sourceToParse.author3lastname != "" && sourceToParse.author3lastname != null) {
                        sourceToParse.parsedSource += " et " + sourceToParse.author3lastname.toUpperCase();
                    }else {
                        sourceToParse.errors.push("Nom du troisième auteur manquant");
                        sourceToParse.parsedSource += ", ?";
                    }
                    // Author 3 first name
                    if (sourceToParse.author3firstname != "" && sourceToParse.author3firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author3firstname + ". ";
                    }else {
                        sourceToParse.errors.push("Prénom du troisième auteur manquant");
                        sourceToParse.parsedSource += ", ?.";
                    }
                }else {
                    sourceToParse.parsedSource += ". ";
                }
            }else if (sourceToParse.hasAuthors == "more3") {
                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase() + ", ";
                    }else {
                        sourceToParse.errors.push("Nom du premier auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du premier auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push("Nom et prénom du premier auteur manquants");
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase();
                    }else {
                        sourceToParse.errors.push("Nom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }

                    sourceToParse.parsedSource += " et al. ";
                }else {
                    sourceToParse.parsedSource += " et al. ";
                }
            }else if (sourceToParse.hasAuthors == "collective") {
                if ((sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) || (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null)) {
                    // Author last name
                    if (sourceToParse.author1lastname != "" && sourceToParse.author1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase() + ", ";
                    }else {
                        sourceToParse.errors.push("Nom du premier auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author first name
                    if (sourceToParse.author1firstname != "" && sourceToParse.author1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.author1firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du premier auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }
                }else {
                    sourceToParse.errors.push("Nom et prénom du premier auteur manquants");
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) || (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null)) {
                    // Author 2 last name
                    if (sourceToParse.author2lastname != "" && sourceToParse.author2lastname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase();
                    }else {
                        sourceToParse.errors.push("Nom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                    // Author 2 first name
                    if (sourceToParse.author2firstname != "" && sourceToParse.author2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }
                    sourceToParse.parsedSource += " (dir). ";
                }else {
                    sourceToParse.parsedSource += " (dir). ";
                }
            }else {
                sourceToParse.parsedSource += "?. "
            }

            // Titre
            if (sourceToParse.title != null && sourceToParse.title != "") {
                sourceToParse.parsedSource += "<em>" + sourceToParse.title + "</em>, ";
            }else {
                sourceToParse.errors.push("Aucun titre spécifié");
                sourceToParse.parsedSource += "<em>?</em>, ";
            }

            // Édition
            if (sourceToParse.editionNumber != null && sourceToParse.editionNumber != "") {
                switch (sourceToParse.editionNumber) {
                    case 1:
                        sourceToParse.parsedSource += "1<sup>re</sup> ";
                        break;
                    default:
                        sourceToParse.parsedSource += sourceToParse.editionNumber + "<sup>e</sup> ";
                }
                sourceToParse.parsedSource += "édition, ";
            }

            // Collection
            if (sourceToParse.collection != null && sourceToParse.collection != "") {
                sourceToParse.parsedSource += "coll. " + sourceToParse.collection + ", ";
            }

            // Traduction
            if (sourceToParse.hasBeenTranslated) {
                // Langue
                if (sourceToParse.translatedFrom != null && sourceToParse.translatedFrom != "") {
                    if ((/^[aeiou]$/i).test(sourceToParse.translatedFrom.substr(0, 1))) {
                        sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase() + " ";
                    }else if (sourceToParse.translatedFrom.toLowerCase().substr(0, 1) == "h") {
                        var arr_la = ["hawaïen", "hébreu", "hindi"];
                        var arr_du = ["hongrois", "huron"];
                        if (arr_la.indexOf(sourceToParse.translatedFrom.toLowerCase()) != -1) {
                            sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase() + " ";
                        }else if (arr_du.indexOf(sourceToParse.translatedFrom.toLowerCase()) != -1) {
                            sourceToParse.parsedSource += "trad. du " + sourceToParse.translatedFrom.toLowerCase() + " ";
                        }else {
                            sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase() + " ";
                        }
                    }else {
                        sourceToParse.parsedSource += "trad. du " + sourceToParse.translatedFrom.toLowerCase() + " ";
                    }
                }else {
                    sourceToParse.errors.push("Aucune langue d'origine de la traduction spécifiée");
                    sourceToParse.parsedSource += "trad. de ? ";
                }

                // Traducteurs
                if ((sourceToParse.translator1lastname != "" && sourceToParse.translator1lastname != null) || (sourceToParse.translator1firstname != "" && sourceToParse.translator1firstname != null)) {
                    sourceToParse.parsedSource += "par ";
                    // Translator's first name
                    if (sourceToParse.translator1firstname != "" && sourceToParse.translator1firstname != null) {
                        sourceToParse.parsedSource += sourceToParse.translator1firstname + " ";
                    }else {
                        sourceToParse.errors.push("Prénom du premier auteur manquant");
                        sourceToParse.parsedSource += "? ";
                    }
                    // Translator's last name
                    if (sourceToParse.translator1lastname != "" && sourceToParse.translator1lastname != null) {
                        sourceToParse.parsedSource += sourceToParse.translator1lastname;
                    }else {
                        sourceToParse.errors.push("Nom du premier auteur manquant");
                        sourceToParse.parsedSource += "? ";
                    }
                }else {
                    sourceToParse.errors.push("Nom et prénom du premier traducteur manquants");
                    sourceToParse.parsedSource += "?";
                }

                if ((sourceToParse.translator2lastname != "" && sourceToParse.translator2lastname != null) || (sourceToParse.translator2firstname != "" && sourceToParse.translator2firstname != null)) {
                    // Translator 2 first name
                    if (sourceToParse.translator2firstname != "" && sourceToParse.translator2firstname != null) {
                        sourceToParse.parsedSource += ", " + sourceToParse.translator2firstname;
                    }else {
                        sourceToParse.errors.push("Prénom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?";
                    }
                    // Translator 2 last name
                    if (sourceToParse.translator2lastname != "" && sourceToParse.translator2lastname != null) {
                        sourceToParse.parsedSource += " " + sourceToParse.translator2lastname + ", ";
                    }else {
                        sourceToParse.errors.push("Nom du deuxième auteur manquant");
                        sourceToParse.parsedSource += "?, ";
                    }
                }else {
                    sourceToParse.parsedSource += ", ";
                }
            }

            // Lieu
            if (sourceToParse.publicationLocation != null && sourceToParse.publicationLocation != "") {
                sourceToParse.parsedSource += sourceToParse.publicationLocation.capitalizeFirstLetter() + ", ";
            }else {
                sourceToParse.parsedSource += "s.l., ";
                sourceToParse.warnings.push("Lieu d'édition non spécifié");
            }

            // Éditeur
            if (sourceToParse.editor != null && sourceToParse.editor != "") {
                sourceToParse.parsedSource += sourceToParse.editor + ", ";
            }else {
                sourceToParse.parsedSource += "?, ";
                sourceToParse.errors.push("Éditeur non spécifié");
            }

            // Date
            if (sourceToParse.publicationDate != null && sourceToParse.publicationDate != "") {
                sourceToParse.parsedSource += sourceToParse.publicationDate + ", ";
            }else {
                sourceToParse.parsedSource += "s.d., ";
                sourceToParse.warnings.push("Date d'édition non spécifiée");
            }

            // Volume
            if (sourceToParse.volumeNumber != null && sourceToParse.volumeNumber != "") {
                sourceToParse.parsedSource += "vol. " + sourceToParse.volumeNumber + ", ";
            }

            // Nombre de pages
            if (sourceToParse.pageNumber != null && sourceToParse.pageNumber != "") {
                sourceToParse.parsedSource += sourceToParse.pageNumber + " p.";
            }else {
                sourceToParse.parsedSource += "? p.";
                sourceToParse.errors.push("Nombre de page non spécifié");
            }

            return sourceToParse;
        }else if (sourceToParse.type == "article") {

        }else if (sourceToParse.type == "internet") {

        }else if (sourceToParse.type == "cd") {

        }else if (sourceToParse.type == "movie") {

        }else if (sourceToParse.type == "interview") {

        }else {
            return null;
        }
    }

    $scope.submitSource = function () {
        if ($scope.newsource.type != "" && $scope.newsource.type != null) {
            $scope.project.sources.push($scope.parseSource($scope.newsource));
            // Save to db
            $scope.closeModal();
        }else {
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: 'La source doit avoir un type'
            });
            return;
        }
    }

    $scope.deleteSource = function (id) {
        // Delete the source
    }
    // Initialize
    $scope.analyseProjectInfo = function (doc) {
        $scope.project.name = doc.name;
        $scope.project.id = doc.id;
        $scope.project.matter = doc.matter;
    }

    $scope.analyseItemsInfo = function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            if (result.rows[i].project_id == $stateParams.projectID) {
                $scope.project.sources.push(result.rows[i]);
            }
        }
    }


    $scope.projectRepo.get($stateParams.projectID).then($scope.analyseProjectInfo);

    $scope.sourceRepo.allDocs({ include_docs: true }).then($scope.analyseItemsInfo);


})




.controller('RefCtrl', function($scope, Articles) {
  $scope.articles = Articles.all();
})




.controller('RefDetailCtrl', function($scope, $stateParams, Articles, $ionicNavBarDelegate) {
  $scope.article = Articles.get($stateParams.articleId);

  $scope.share = function () {
      text = document.querySelectorAll("ion-content#sub-content")[0].innerText;
      window.plugins.socialsharing.share(text, $scope.article.name);
  }
})





.controller('RefSubDetailCtrl', function($scope, $stateParams, Articles) {
    $scope.article = Articles.get($stateParams.articleId).subPages[$stateParams.subId];

    $scope.shareSub = function () {
      text = document.querySelectorAll("ion-content#sub-detail-content")[0].innerText;
      window.plugins.socialsharing.share(text, $scope.article.name);
    }
})




.controller('SettingsCtrl', function($scope, localStorageService, Settings) {
    // Get settings from service
    $scope.settings = Settings.all();

    // Commit changes to settings service
    $scope.changeSettings = function (setting) {
        Settings.set(setting, $scope.settings[setting]);
    }
});
