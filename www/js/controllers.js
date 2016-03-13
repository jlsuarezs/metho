angular.module('starter.controllers', [])

.controller('ProjectsCtrl', function($scope, $ionicModal, $ionicPlatform) {
    $scope.projects = [];
    $scope.project = { name:"" };
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

    $scope.closeModal = function () {
        $scope.newProjectModal.hide();
        $scope.errorName = false;
    }

    $scope.newProject = function () {
        $scope.newProjectModal.show();
    }

    $scope.submitProject = function () {
        if ($scope.project.name == "") {
            $scope.errorName = true;
        }else {
            $scope.errorName = false;
            var creatingProj = {
                name: $scope.project.name,
                matter: $scope.project.matter
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
    }
})

.controller('ProjectDetailCtrl', function($scope, $stateParams, $ionicModal) {
    $scope.projectRepo = new PouchDB("projects");
    $scope.sourceRepo = new PouchDB("sources");
    $scope.project = {
        name: "",
        id: "",
        matter: "",
        sources: []
    };

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
    $scope.settings = {
        advanced: localStorageService.get("setting-advanced")
    };

    $scope.changeSettings = function (setting) {
        localStorageService.set("setting-" + setting, $scope.settings.advanced);
    }
});
