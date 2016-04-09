angular.module('metho.controller.projects.tab', [])

.controller('ProjectsCtrl', function($scope, $ionicModal, $ionicPlatform, $ionicPopup, $ionicListDelegate, ShareProject, $state) {
    $scope.projects = [];
    $scope.project = {
        name: "",
        matter: ""
    };
    $scope.editingProject = {};
    $scope.err = "";
    $scope.errorName = false;
    $scope.loading = true;
    // Initialize the DB
    $scope.projectsRepo = new PouchDB("projects");
    // Load the projects
    $scope.projectsRepo.allDocs({
        include_docs: true
    }).then(function(result) {
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
    }).catch(function(err) {
        console.log(err);
    });

    $ionicModal.fromTemplateUrl('templates/new.project.modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.newProjectModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/edit.project.modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.editProjectModal = modal;
    });

    $scope.closeModal = function() {
        $scope.newProjectModal.hide();
        $scope.errorName = false;
    }

    $scope.closeEditModal = function() {
        $scope.editProjectModal.hide();
        $scope.errorName = false;
    }

    $scope.newProject = function() {
        $scope.newProjectModal.show();
    }

    $scope.submitProject = function() {
        if ($scope.project.name == "" ||  $scope.project.name == null) {
            $scope.errorName = true;
            var alertPopup = $ionicPopup.alert({
                title: 'Erreur',
                template: '<p class="center">Entrez un nom de projet</p>'
            });
        } else {
            $scope.errorName = false;
            if ($scope.project.matter == "" || $scope.project.matter == null) {
                var theMatter = "Matière inconnue";
            } else {
                var theMatter = $scope.project.matter;
            }
            var creatingProj = {
                name: $scope.project.name,
                matter: theMatter
            };

            $scope.projectsRepo.post(creatingProj).then(function(response) {
                creatingProj.id = response.id;
                $scope.projects.push(creatingProj);
                $scope.project = {
                    name: "",
                    matter: ""
                };
                $scope.newProjectModal.hide();
                $scope.$apply();
            }).catch(function(err) {
                console.log(err);
            });
        }
    }

    $scope.deleteProject = function(id) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Voulez-vous supprimer ce projet ?',
            template: '<p class="center">La suppression de ce projet entrainera la perte de toutes les sources contenues dans celui-ci. Cette action est irréversible.</p>',
            cancelText: 'Annuler',
            okText: '<b>Supprimer</b>',
            okType: 'button-assertive',
            cssClass: 'deleteProject'
        });
        confirmPopup.then(function(res) {
            if (res) {
                $scope.projectsRepo.get(id).then(function(doc) {
                    return $scope.projectsRepo.remove(doc);
                }).then(function(result) {
                    for (var i = 0; i < $scope.projects.length; i++) {
                        if ($scope.projects[i].id == result.id) {
                            $scope.projects.splice(i, 1);
                            $scope.$apply();
                            return;
                        }
                    }
                }).catch(function(err) {
                    console.log(err);
                });
            } else {
                $ionicListDelegate.closeOptionButtons();
            }
        });

    }

    $scope.editProject = function(id) {
        $scope.editingProject = {};
        $scope.projectsRepo.get(id).then(function(doc) {
            $scope.editingProject.name = doc.name;
            if (doc.matter == "Matière inconnue") {
                $scope.editingProject.matter = "";
            } else {
                $scope.editingProject.matter = doc.matter;
            }
            $scope.editingProject.id = doc._id;
        });
        $scope.editProjectModal.show();
    }

    $scope.submitEditProject = function() {
        if ($scope.editingProject.name == "") {
            $scope.errorName = true;
            var alertPopup = $ionicPopup.alert({
                title: 'Erreur',
                template: 'Le projet doit avoir un nom.'
            });
        } else {
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
                        } else {
                            $scope.projects[i].matter = $scope.editingProject.matter;
                        }
                    }
                }
            }).catch(function(err) {
                console.log(err);
            });
            $scope.editProjectModal.hide();
            $ionicListDelegate.closeOptionButtons();
        }
    }

    $scope.openProjectDetail = function(id) {
        for (var i = 0; i < $scope.projects.length; i++) {
            if ($scope.projects[i].id == id) {
                var index = i;
                break;
            }
        }
        ShareProject.setName($scope.projects[index].name);
        ShareProject.setMatter($scope.projects[index].matter);
        $state.go("tab.project-detail", {
            projectID: id
        });
    }
});
