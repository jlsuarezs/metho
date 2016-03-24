angular.module('starter.controllers', [])

.controller('ProjectsCtrl', function($scope, $ionicModal, $ionicPlatform, $ionicPopup, $ionicListDelegate) {
    $scope.projects = [];
    $scope.project = { name:"" };
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
        if ($scope.project.name == "") {
            $scope.errorName = true;
            var alertPopup = $ionicPopup.alert({
             title: 'Erreur',
             template: '<p class="center">Entrez un nom de projet</p>'
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






.controller('ProjectDetailCtrl', function($scope, $stateParams, $ionicModal, $ionicPopup, $ionicScrollDelegate, $parseSource) {
    $scope.projectRepo = new PouchDB("projects");
    $scope.sourceRepo = new PouchDB("sources");
    $scope.project = {
        name: "",
        id: "",
        matter: "",
        sources: []
    };
    $scope.loading = true;
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
        window.plugins.socialsharing.shareViaEmail(
          textToShare,
          project.name,
          [], // TO: must be null or an array
          [], // CC: must be null or an array
          null, // BCC: must be null or an array
          [], // FILES: can be null, a string, or an array
          function () {

          }, // called when sharing worked, but also when the user cancelled sharing via email (I've found no way to detect the difference)
          function () {

          } // called when sh*t hits the fan
        );
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

    $scope.addSource = function () {
        // Open modal
        $scope.newSourceModal.show();
    }

    $scope.closeModal = function () {
        $scope.newSourceModal.hide();
        $scope.resetModalVars();
    }

    $scope.submitSource = function () {
        if ($scope.newsource.type != "" && $scope.newsource.type != null) {
            var creatingProj = $parseSource.parseSource($scope.newsource);
            creatingProj.project_id = $stateParams.projectID;
            // Save to db
            $scope.sourceRepo.post(creatingProj).then(function (response) {
                creatingProj._id = response.id;
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
                  for (var i = 0; i < $scope.project.sources.length; i++) {
                      if ($scope.project.sources[i]._id == result.id) {
                          $scope.project.sources.splice(i, 1);
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
    // Initialize
    $scope.analyseProjectInfo = function (doc) {
        $scope.project.name = doc.name;
        $scope.project.id = doc._id;
        $scope.project.matter = doc.matter;
    }

    $scope.analyseItemsInfo = function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            if (result.rows[i].doc.project_id == $stateParams.projectID) {
                $scope.project.sources.push(result.rows[i].doc);
            }
        }
        $scope.loading = false;
    }


    $scope.projectRepo.get($stateParams.projectID).then($scope.analyseProjectInfo);

    $scope.sourceRepo.allDocs({ include_docs: true }).then($scope.analyseItemsInfo);

})

.controller('SourceDetailCtrl', function ($scope, $stateParams) {
    $scope.source = {};
    $scope.sourceRepo = new PouchDB("sources");
    $scope.projectRepo = new PouchDB("projects");

    // Init
    $scope.analyseSourceInfo = function (result) {
        $scope.source = result;
    }

    $scope.analyseProjectInfo = function (doc) {
        $scope.project.name = doc.name;
        $scope.project.id = doc._id;
        $scope.project.matter = doc.matter;
    }

    $scope.projectRepo.get($stateParams.projectID).then($scope.analyseProjectInfo);

    $scope.sourceRepo.get($stateParams.sourceID).then($scope.analyseSourceInfo);
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
