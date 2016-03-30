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
.controller('ProjectDetailCtrl', function($scope, $stateParams, $ionicModal, $ionicPopup, $ionicScrollDelegate, $parseSource, ShareProject, ShareSource, $state, $ionicListDelegate) {
    $scope.projectRepo = new PouchDB("projects");
    $scope.sourceRepo = new PouchDB("sources");
    $scope.project = {
        name: ShareProject.getName(),
        id: $stateParams.projectID,
        matter: ShareProject.getMatter(),
        sources: []
    };
    $scope.loading = true;
    $scope.animateRemove = true;
    $scope.newsource = {};
    $scope.newsource.consultationDate = new Date();
    $scope.refreshID = null;
    $scope.refreshIndex = null;

    $ionicModal.fromTemplateUrl('templates/modal_new_source.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newSourceModal = modal;
    });

    $scope.share = function () {
        var textToShare = "Voici les sources du projet « " + $scope.project.name + " » : <br><br>";
        var errNum = 0;
        for (var i = 0; i < $scope.project.sources.length; i++) {
            textToShare += $scope.project.sources[i].parsedSource + "<br><br>";
            errNum += $scope.project.sources[i].errors.length;
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
        $scope.newSourceModal.show();
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

    $scope.analyseItemsInfo = function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            if (result.rows[i].doc.project_id == $stateParams.projectID) {
                $scope.project.sources.push(result.rows[i].doc);
            }
        }
        $scope.loading = false;
    }

    $scope.sourceRepo.allDocs({ include_docs: true }).then($scope.analyseItemsInfo);

    $scope.$on("$ionicView.beforeEnter", function () {
        if ($scope.refreshID != null) {
            $scope.sourceRepo.get($scope.refreshID).then(function (result) {
                $scope.project.sources[$scope.refreshIndex] = result;
            });
        }
    });

    $scope.openSourceDetail = function (id) {
        for (var i = 0; i < $scope.project.sources.length; i++) {
            if ($scope.project.sources[i]._id == id) {
                var index = i;
                break;
            }
        }
        console.log(index);
        ShareSource.setSource($scope.project.sources[index]);
        $state.go('tab.source-detail', {projectID:$stateParams.projectID, sourceID:id});
        $scope.refreshID = id;
        $scope.refreshIndex = index;
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
                        case "consultationDate":
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
});
