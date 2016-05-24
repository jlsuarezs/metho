angular.module("metho.service.storage", [])

.factory("Storage", function (localStorageService, ParseSource, $q, $rootScope, ReportUser, $ionicPlatform) {
    if (localStorageService.get("theresProjects") == null) {
        localStorageService.set("theresProjects", false);
    }
    var theresProjects = localStorageService.get("theresProjects");
    this.projectRepo = null;
    this.sourceRepo = null;
    this.pendingRepo = null;

    var projects = {};
    var loadingProjects = true;

    var sources = {};
    var sourcesByProject = {};
    var loadingSources = true;

    var pendings = {};
    var pendingsByProject = {};
    var loadingPendings = true;

    if (!theresProjects) {
        loadingProjects = false;
    }

    return {
        init: function () {
            this.sourceRepo = new PouchDB("sources");
            this.projectRepo = new PouchDB("projects");
            this.pendingRepo = new PouchDB("pendings");

            if (theresProjects) {
                this.projectRepo.allDocs({include_docs: true}).then(function (docs) {
                    for (var i = 0; i < docs.rows.length; i++) {
                        projects[docs.rows[i].doc._id] = docs.rows[i].doc;
                        if (sourcesByProject[docs.rows[i].doc._id] == null) {
                            sourcesByProject[docs.rows[i].doc._id] = {};
                        }
                    }
                    loadingProjects = false;
                    $rootScope.$broadcast("projectLoadingEnded");
                }).catch(function (err) {
                    loadingProjects = false;
                    $rootScope.$broadcast("projectLoadingEnded");
                    ReportUser.report(err);
                });
            }

            this.sourceRepo.allDocs({include_docs: true}).then(function (docs) {
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
                $rootScope.$broadcast("sourceLoadingEnded");
                ReportUser.report(err);
            });

            this.pendingRepo.allDocs({include_docs: true}).then(function (docs) {
                for (var i = 0; i < docs.rows.length; i++) {
                    pendings[docs.rows[i].doc._id] = docs.rows[i].doc;
                    if (pendingsByProject[docs.rows[i].doc.project_id] == null) {
                        pendingsByProject[docs.rows[i].doc.project_id] = {};
                    }
                    pendingsByProject[docs.rows[i].doc.project_id][docs.rows[i].doc._id] = docs.rows[i].doc;
                }
                loadingPendings = false;
                $rootScope.$broadcast("pendingLoadingEnded");
            }).catch(function (err) {
                $rootScope.$broadcast("pendingLoadingEnded");
                loadingPendings = false;
                ReportUser.report(err);
            });
        },
        getProjects: function () {
            var p = $q.defer();

            if (loadingProjects) {
                p.notify("loading");
                var unregister = $rootScope.$on("projectLoadingEnded", function () {
                    unregister();
                    p.resolve(Array.prototype.fromObject(projects));
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

            this.projectRepo.remove(doc).then(function(result) {
                p.resolve(result);
            }).catch(function(err) {
                ReportUser.report(err);
                p.reject(err);
            });

            for (var i = 0; i < arr_sourcesToDelete.length; i++) {
                this.sourceRepo.remove(arr_sourcesToDelete[i]);
            }

            if (Array.prototype.fromObject(projects) == 0) {
                localStorageService.set("theresProjects", false);
            }

            return p.promise;
        },
        setProjectFromId: function (id, set) {
            var p = $q.defer();

            this.projectRepo.put(set, id, projects[id]._rev).then(function(response) {
                set._rev = response.rev;
                projects[id] = set;
                p.resolve(response);
            }).catch(function(err) {
                ReportUser.report(err);
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
            }else {
                p.resolve(projects[id]);
            }

            return p.promise;
        },
        createProject: function (newproject) {
            var p = $q.defer();

            loadingProjects = true;
            loadingSources = true;
            this.projectRepo.post(newproject).then(function(response) {
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
                loadingProjects = false;
                loadingSources = false;
                $rootScope.$broadcast("sourceLoadingEnded");
                $rootScope.$broadcast("projectLoadingEnded");
                ReportUser.report(err);
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
                    loadingSources = true;
                    var arr_sources = Array.prototype.fromObject(sources);
                    var source = {};
                    for (var i = 0; i < arr_sources.length; i++) {
                        source[arr_sources[i]._id] = ParseSource.parseSource(arr_sources[i]);
                        if (i == arr_sources.length - 1) {
                            this.sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
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
                                ReportUser.report(JSON.parse(errors));
                                p.reject(errors);
                            });
                        }else {
                            this.sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
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
                        this.sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
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
                            ReportUser.report(JSON.parse(errors));
                            p.reject(errors);
                        });
                    }else {
                        this.sourceRepo.put(source[arr_sources[i]._id]).then(function (response) {
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
                    unregister();
                    loadingSources = true;
                    this.sourceRepo.put(set, id, sources[id]._rev).then(function (response) {
                        sources[id] = set;
                        sources[id]._rev = response.rev;
                        sourcesByProject[sources[id].project_id][id] = set;
                        sourcesByProject[sources[id].project_id][id]._rev = response.rev;
                        $rootScope.$broadcast("sourceLoadingEnded");
                        loadingSources = false;
                        p.resolve(response);
                    }).catch(function (err) {
                        ReportUser.report(err);
                        p.reject(err);
                        $rootScope.$broadcast("sourceLoadingEnded");
                        loadingSources = false;
                    });
                });
            }else {
                loadingSources = true;
                this.sourceRepo.put(set, id, sources[id]._rev).then(function (response) {
                    sources[id] = set;
                    sources[id]._rev = response.rev;
                    sourcesByProject[sources[id].project_id][id] = set;
                    sourcesByProject[sources[id].project_id][id]._rev = response.rev;
                    $rootScope.$broadcast("sourceLoadingEnded");
                    p.resolve(response);
                    loadingSources = false;
                }).catch(function (err) {
                    ReportUser.report(err);
                    p.reject(err);
                    $rootScope.$broadcast("sourceLoadingEnded");
                    loadingSources = false;
                });
            }
            return p.promise;
        },
        createSource: function (newsource) {
            var p = $q.defer();

            this.sourceRepo.post(newsource).then(function (response) {
                newsource._id = response.id;
                newsource._rev = response.rev;

                sourcesByProject[newsource.project_id][newsource._id] = newsource;
                sources[newsource._id] = newsource;

                p.resolve(response);
            }).catch(function (err) {
                ReportUser.report(err);
                p.reject(err);
            });

            return p.promise;
        },
        deleteSource: function (id) {
            var p = $q.defer();

            var doc = sources[id];
            delete sources[id];
            delete sourcesByProject[doc.project_id][id];

            this.sourceRepo.remove(doc).then(function(result) {
                p.resolve(result);
            }).catch(function(err) {
                ReportUser.report(err);
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
            }else {
                p.resolve(Array.prototype.fromObject(pendings));
            }

            return p.promise;
        },
        getPendingsFromProjectId: function (id) {
            var p = $q.defer();

            if (loadingPendings) {
                p.notify("loading");
                var unregister = $rootScope.$on("pendingLoadingEnded", function () {
                    unregister();
                    p.resolve(Array.prototype.fromObject(pendingsByProject[id]));
                });
            }else {
                p.resolve(Array.prototype.fromObject(pendingsByProject[id]));
            }

            return p.promise;
        },
        createPending: function (newpending) {
            var p = $q.defer();

            this.pendingRepo.post(newpending).then(function(response) {
                newpending._id = response.id;
                newpending._rev = response.rev;

                if (!pendingsByProject[newpending.project_id]) {
                    pendingsByProject[newpending.project_id] = {};
                }

                pendings[newpending._id] = newpending;
                pendingsByProject[newpending.project_id][newpending._id] = newpending;

                p.resolve(response);
            }).catch(function (err) {
                ReportUser.report(err);
                p.reject(err);
            });

            return p.promise;
        },
        deletePending: function (id) {
            var p = $q.defer();

            loadingPendings = true;
            this.pendingRepo.remove(pendings[id]).then(function (response) {
                delete pendingsByProject[pendings[id].project_id][id];
                delete pendings[id];

                $rootScope.$broadcast("pendingLoadingEnded");
                loadingPendings = false;

                p.resolve(response);
            }).catch(function (err) {
                loadingPendings = false;
                $rootScope.$broadcast("pendingLoadingEnded");
                ReportUser.report(err);
                p.reject(err);
            });

            return p.promise;
        },
        setPendingFromId: function (id, set) {
            var p = $q.defer();

            this.pendingRepo.put(set, id, pendings[id]._rev).then(function (response) {
                set._rev = response.rev;

                pendings[id] = set;
                pendingsByProject[set.project_id][id] = set;

                p.resolve(response);
            }).catch(function (err) {
                ReportUser.report(err);
                p.reject(err);
            })

            return p.promise;
        },
        getPendingNumber: function (id) {
            var p = $q.defer();

            if (loadingPendings) {
                var unregister = $rootScope.$on("pendingLoadingEnded", function () {
                    unregister();
                    var arr_pendings = Array.prototype.fromObject(pendingsByProject[id]);
                    p.resolve(arr_pendings.length ? arr_pendings.length : 0);
                });
            }else {
                var arr_pendings = Array.prototype.fromObject(pendingsByProject[id]);
                p.resolve(arr_pendings.length ? arr_pendings.length : 0);
            }

            return p.promise;
        }
    };
});
