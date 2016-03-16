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
          title: 'Supprimer',
          template: 'Voulez-vous supprimer ce projet ?',
          cancelText: 'Annuler',
          okText: '<b>Confirmer</b>'
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

    $scope.share = function () {
        var textToShare = "";
        for (var i = 0; i < $scope.project.sources.length; i++) {
            textToShare += $scope.project.sources[i].parsed_source + "\n";
        }
        window.plugins.socialsharing.share(text, $scope.article.name);
    }

    $scope.resetModalVars = function () {
        // Reset vars
        $scope.newsource = {};
    }

    $scope.refreshModalScroll = function () {
        $ionicScrollDelegate.resize();
    }

    // Refresh view on length change
    $scope.$watch("newsource.hasBeenTranslated", $scope.refreshModalScroll);
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


    $scope.addSource = function () {
        // Open modal
        $scope.newSourceModal.show();
    }

    $scope.closeModal = function () {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
    }

    $scope.submitSource = function () {


        $scope.closeModal();
    }

    // Initialize
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




.controller('SettingsCtrl', function($scope, localStorageService) {
    if (localStorageService.get("setting-advanced") == null) {
        localStorageService.set("setting-advanced", false);
    }

    if (localStorageService.get("setting-askForOrder") == null) {
        localStorageService.set("setting-askForOrder", true);
    }

    if (localStorageService.get("setting-defaultOrder") == null) {
        localStorageService.set("setting-defaultOrder", "alpha");
    }

    $scope.settings = {
        advanced: localStorageService.get("setting-advanced"),
        askForOrder: localStorageService.get("setting-askForOrder"),
        defaultOrder: localStorageService.get("setting-defaultOrder")
    };

    $scope.changeSettings = function (setting) {
        localStorageService.set("setting-" + setting, $scope.settings[setting]);
    }
});
