angular.module("metho.service.storage", [])

.factory("Storage", function (localStorageService, ParseSource, $q, $rootScope) {
    if (localStorageService.get("theresProjects") == null) {
        localStorageService.set("theresProjects", false);
    }
    var theresProjects = localStorageService.get("theresProjects");
    var sourceRepo = new PouchDB("sources");
    var projectRepo = new PouchDB("projects");
    var pendingRepo = new PouchDB("pendings");

    var projects = {};
    var loadingProjects = true;

    var sources = {};
    var sourcesByProject = {};
    var loadingSources = true;

    var pendings = {};
    var loadingPendings = true;

    if (theresProjects) {
        projectRepo.allDocs({include_docs: true}).then(function (docs) {
            for (var i = 0; i < docs.rows.length; i++) {
                projects[docs.rows[i].doc._id] = docs.rows[i].doc;
                if (sourcesByProject[docs.rows[i].doc._id] == null) {
                    sourcesByProject[docs.rows[i].doc._id] = {};
                }
            }
            loadingProjects = false;
            $rootScope.$broadcast("projectLoadingEnded");
        }).catch(function (err) {
            $rootScope.$broadcast("projectLoadingError", err);
            loadingProjects = false;
        });
    }else {
        loadingProjects = false;
    }

    sourceRepo.allDocs({include_docs: true}).then(function (docs) {
        for (var i = 0; i < docs.rows.length; i++) {
            sources[docs.rows[i].doc._id] = docs.rows[i].doc;
            if (sourcesByProject[docs.rows[i].doc.project_id] == null) {
                sourcesByProject[docs.rows[i].doc.project_id] = {};
            }
            sourcesByProject[docs.rows[i].doc.project_id][docs.rows[i].doc._id] = docs.rows[i].doc;
        }
        loadingSources = false;
        $rootScope.$broadcast("sourceLoadingEnded");
    }).catch(function (err) {
        loadingSources = false;
        $rootScope.$broadcast("sourceLoadingError", err);
        console.log(err);
    });

    pendingRepo.allDocs({include_docs: true}).then(function (docs) {
        for (var i = 0; i < docs.rows.length; i++) {
            pendings[docs.rows[i].doc._id] = docs.rows[i].doc;
        }
        loadingPendings = false;
        $rootScope.$broadcast("pendingLoadingEnded");
    }).catch(function (err) {
        $rootScope.$broadcast("pendingLoadingError", err);
        loadingPendings = false;
        console.log(err);
    });

    return {
        getProjects: function () {
            var p = $q.defer();
            if (loadingProjects) {
                p.notify("loading");
                $rootScope.$on("projectLoadingEnded", function () {
                    p.resolve(Array.prototype.fromObject(projects));
                });
                $rootScope.$on("projectLoadingError", function (err) {
                    p.reject("error : " + err);
                });
            }else {
                p.resolve(Array.prototype.fromObject(projects));
            }

            return p.promise;
        },
        deleteProject: function (id) {
            var p = $q.defer();

            var doc = projects[id];
            delete projects[id];
            var arr_sourcesToDelete = [];
            for (var i = 0; i < sourcesByProject[id].length; i++) {
                delete sources[sourcesByProject[id][i]._id];
                arr_sourcesToDelete.append(sourcesByProject[id][i]);
            }
            delete sourcesByProject[id];

            // Apply
            // Delete project
            projectRepo.remove(doc).then(function(result) {
                p.resolve(result);
            }).catch(function(err) {
                p.reject(err);
            });

            // Delete sources of project
            for (var i = 0; i < arr_sourcesToDelete.length; i++) {
                sourceRepo.remove(arr_sourcesToDelete[i]);
            }

            if (Array.prototype.fromObject(projects) == 0) {
                localStorageService.set("theresProjects", false);
            }

            return p.promise;
        },
        setProjectFromId: function (id, set) {
            var p = $q.defer();

            projectRepo.put(set, id, projects[id]._rev).then(function(response) {
                set._rev = response.rev;
                projects[id] = set;
                p.resolve(response);
            }).catch(function(err) {
                p.reject(err);
            });

            return p.promise;
        },
        getProjectFromId: function (id) {
            var p = $q.defer();

            if (loadingProjects) {
                var unregister = $rootScope.$on("projectLoadingEnded", function () {
                    unregister();
                    p.resolve(projects[id]);
                });
                var unregisterErr = $rootScope.$on("projectLoadingError", function (err) {
                    unregisterErr();
                    unregister();
                    p.reject(err);
                });
            }else {
                p.resolve(projects[id]);
            }

            return p.promise;
        },
        createProject: function (newproject) {
            var p = $q.defer();

            loadingProjects = true;
            loadingSources = true;
            projectRepo.post(newproject).then(function(response) {
                sourcesByProject[response.id] = {};
                newproject._id = response.id;
                newproject._rev = response.rev;
                projects[response.id] = newproject;
                loadingProjects = false;
                loadingSources = false;
                $rootScope.$broadcast("sourceLoadingEnded");
                $rootScope.$broadcast("projectLoadingEnded");
                p.resolve(response);
            }).catch(function(err) {
                p.reject(err);
            });

            localStorageService.set("theresProjects", true);

            return p.promise;
        },
        getSourcesFromProjectId: function (id) {
            var p = $q.defer();

            if (loadingSources) {
                p.notify("loading");
                var unregister = $rootScope.$on("sourceLoadingEnded", function () {
                    unregister();
                    p.resolve(Array.prototype.fromObject(sourcesByProject[id]));
                });
                var unregisterErr = $rootScope.$on("sourceLoadingError", function (err) {
                    unregister();
                    unregisterErr();
                    p.reject(err);
                });
            }else {
                p.resolve(Array.prototype.fromObject(sourcesByProject[id]));
            }

            return p.promise;
        },
        getSourceFromId: function (id) {
            var p = $q.defer();

            if (loadingSources) {
                p.notify("loading");
                var unregister = $rootScope.$on("sourceLoadingEnded", function () {
                    unregister();
                    p.resolve(sources[id]);
                });
                var unregisterErr = $rootScope.$on("sourceLoadingError", function (err) {
                    unregister();
                    unregisterErr();
                    p.reject(err);
                });
            }else {
                p.resolve(sources[id]);
            }

            return p.promise;
        },
        parseSources: function () {
            var p = $q.defer();
            var errors = [];
            if (loadingSources) {
                var unregister = $rootScope.$on("sourceLoadingEnded", function () {
                    unregister();
                    var arr_sources = Array.prototype.fromObject(sources);
                    loadingSources = true;
                    var source = {};
                    for (var i = 0; i < arr_sources.length; i++) {
                        source[arr_sources[i]._id] = ParseSource.parseSource(arr_sources[i]);
                        if (i == arr_sources.length - 1) {
                            sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
                                source[response.id]._rev = response.rev;
                                sources[response.id] = source[response.id];
                                sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
                                loadingSources = false;
                                $rootScope.$broadcast("sourceLoadingEnded");
                                p.resolve({ok:true});
                            }).catch(function (err) {
                                errors.push(err);
                                loadingSources = false;
                                $rootScope.$broadcast("sourceLoadingEnded");
                                p.reject(errors);
                            });
                        }else {
                            sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
                                source[response.id]._rev = response.rev;
                                sources[response.id] = source[response.id];
                                sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
                            }).catch(function (err) {
                                console.log(err);
                                errors.push(err);
                            });
                        }
                    }
                });
            }else {
                var arr_sources = Array.prototype.fromObject(sources);
                loadingSources = true;
                var source = {};
                for (var i = 0; i < arr_sources.length; i++) {
                    source[arr_sources[i]._id] = ParseSource.parseSource(arr_sources[i]);
                    if (i == arr_sources.length - 1) {
                        sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
                            source[response.id]._rev = response.rev;
                            sources[response.id] = source[response.id];
                            sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
                            loadingSources = false;
                            $rootScope.$broadcast("sourceLoadingEnded");
                            p.resolve({ok:true});
                        }).catch(function (err) {
                            errors.push(err);
                            loadingSources = false;
                            $rootScope.$broadcast("sourceLoadingEnded");
                            p.reject(errors);
                        });
                    }else {
                        sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
                            source[response.id]._rev = response.rev;
                            sources[response.id] = source[response.id];
                            sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
                        }).catch(function (err) {
                            console.log(err);
                            errors.push(err);
                        });
                    }
                }
            }

            return p.promise;
        },
        setSourceFromId: function (id, set) {
            var p = $q.defer();

            if (loadingSources) {
                var unregister = $rootScope.$on("sourceLoadingEnded", function () {
                    loadingSources = true;
                    sourceRepo.put(set, id, sources[id]._rev).then(function (response) {
                        sources[id] = set;
                        sources[id]._rev = response.rev;
                        sourcesByProject[sources[id].project_id][id] = set;
                        sourcesByProject[sources[id].project_id][id]._rev = response.rev;
                        unregister();
                        $rootScope.$broadcast("sourceLoadingEnded");
                        loadingSources = false;
                        p.resolve(response);
                    }).catch(function (err) {
                        p.reject(err);
                        unregister();
                        $rootScope.$broadcast("sourceLoadingError");
                        loadingSources = false;
                    });
                });
            }else {
                loadingSources = true;
                sourceRepo.put(set, id, sources[id]._rev).then(function (response) {
                    sources[id] = set;
                    sources[id]._rev = response.rev;
                    sourcesByProject[sources[id].project_id][id] = set;
                    sourcesByProject[sources[id].project_id][id]._rev = response.rev;
                    $rootScope.$broadcast("sourceLoadingEnded");
                    p.resolve(response);
                    loadingSources = false;
                }).catch(function (err) {
                    p.reject(err);
                    $rootScope.$broadcast("sourceLoadingError");
                    loadingSources = false;
                });
            }
            return p.promise;
        },
        createSource: function (newsource) {
            var p = $q.defer();

            sourceRepo.post(newsource).then(function (response) {
                newsource._id = response.id;
                newsource._rev = response.rev;

                sourcesByProject[newsource.project_id][newsource._id] = newsource;
                sources[newsource._id] = newsource;

                p.resolve(response);
            }).catch(function (err) {
                p.reject(err);
            });

            return p.promise;
        },
        deleteSource: function (id) {
            var p = $q.defer();

            var doc = sources[id];
            delete sources[id];
            delete sourcesByProject[doc.project_id][id];

            sourceRepo.remove(doc).then(function(result) {
                p.resolve(result);
            }).catch(function(err) {
                p.reject(err);
            });

            return p.promise;
        },
        getPendings: function () {
            var p = $q.defer();

            if (loadingPendings) {
                p.notify("loading");
                var unregister = $rootScope.$on("pendingLoadingEnded", function () {
                    unregister();
                    p.resolve(Array.prototype.fromObject(pendings));
                });
                var unregisterErr = $rootScope.$on("pendingLoadingError", function (err) {
                    unregister();
                    unregisterErr();
                    p.reject(err);
                });
            }else {
                p.resolve(Array.prototype.fromObject(pendings));
            }

            return p.promise;
        },
        createPending: function (newpending) {
            var p = $q.defer();

            pendingRepo.post(newpending).then(function(response) {
                newpending._id = response.id;
                newpending._rev = response.rev;

                pendings[newpending._id] = newpending;

                p.resolve(response);
            }).catch(function (err) {
                p.reject(err);
            });

            return p.promise;
        },
        deletePending: function (id) {
            var p = $q.defer();

            loadingPendings = true;
            pendingRepo.remove(pendings[id]).then(function (response) {
                delete pendings[id];
                $rootScope.$broadcast("pendingLoadingEnded");
                loadingPendings = false;
                p.resolve(response);
            }).catch(function (err) {
                loadingPendings = false;
                $rootScope.$broadcast("pendingLoadingError", err);
                p.reject(err);
            });

            return p.promise;
        },
        setPendingFromId: function (id, set) {
            var p = $q.defer();

            pendingRepo.put(set, id, pendings[id]._rev).then(function (response) {
                set._rev = response.rev;

                pendings[id] = set;

                p.resolve(response);
            }).catch(function (err) {
                p.reject(err);
            })

            return p.promise;
        },
        getPendingNumber: function () {
            var p = $q.defer();

            if (loadingPendings) {
                var unregister = $rootScope.$on("pendingLoadingEnded", function () {
                    unregister();
                    var arr_pendings = Array.prototype.fromObject(pendings);
                    p.resolve(arr_pendings.length ? arr_pendings.length : 0);
                });
            }else {
                var arr_pendings = Array.prototype.fromObject(pendings);
                p.resolve(arr_pendings.length ? arr_pendings.length : 0);
            }

            return p.promise;
        }
    };
});
