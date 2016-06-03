import {Injectable, EventEmitter} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';
import {Parse} from '../parse/parse';
import {UserReport} from '../user-report/user-report';

var PouchDB = require("pouchdb");

@Injectable()
export class AppStorage {
  private theresProjects: Boolean = false;
  private projectDB: any = null;
  private sourceDB: any = null;
  private pendingDB: any = null;
  private local: any;
  private projects: Object = {};
  private sources: Object = {};
  private sourcesByProject: Object = {};
  private pendings: Object = {};
  private pendingsByProject: Object = {};

  private loadingProjects: Boolean = true;
  private loadingSources: Boolean = true;
  private loadingPendings: Boolean = true;

  private projectEvents = new EventEmitter();
  private sourcesEvents = new EventEmitter();
  private pendingsEvents = new EventEmitter();


  constructor(public parse: Parse, public report: UserReport) {
    this.local = new Storage(LocalStorage);
    if(this.local.get("theresProjects") == null) {
      this.local.set("theresProjects", false);
    }
    this.theresProjects = this.local.get("theresProjects");
  }

  init() {
    this.projectDB = new PouchDB("projects");
    this.sourceDB = new PouchDB("sources");
    this.pendingDB = new PouchDB("pendings");

    if (this.theresProjects) {
      this.projectDB.allDocs({include_docs: true}).then(docs => {
        for (var i = 0; i < docs.rows.length; i++) {
          this.projects[docs.rows[i].doc._id] = docs.rows[i].doc;
          if (this.sourcesByProject[docs.rows[i].doc._id] == null) {
            this.sourcesByProject[docs.rows[i].doc._id] = {};
          }
        }
        this.loadingProjects = false;
        this.projectEvents.emit("projectLoadingEnded");
      }).catch(err => {
        this.loadingProjects = false;
        this.projectEvents.emit("projectLoadingEnded");
        this.report.report(err);
      });
    }

    this.sourceDB.allDocs({include_docs: true}).then(docs => {
      for (var i = 0; i < docs.rows.length; i++) {
        this.sources[docs.rows[i].doc._id] = docs.rows[i].doc;
        if (this.sourcesByProject[docs.rows[i].doc.project_id] == null) {
          this.sourcesByProject[docs.rows[i].doc.project_id] = {};
        }
        this.sourcesByProject[docs.rows[i].doc.project_id][docs.rows[i].doc._id] = docs.rows[i].doc;
      }
      this.loadingSources = false;
      this.sourcesEvents.emit("sourceLoadingEnded");
    }).catch(err => {
      this.loadingSources = false;
      this.sourcesEvents.emit("sourceLoadingEnded");
      this.report.report(err);
    });

    this.pendingDB.allDocs({include_docs: true}).then(docs => {
      for (var i = 0; i < docs.rows.length; i++) {
        this.pendings[docs.rows[i].doc._id] = docs.rows[i].doc;
        if (this.pendingsByProject[docs.rows[i].doc.project_id] == null) {
          this.pendingsByProject[docs.rows[i].doc.project_id] = {};
        }
        this.pendingsByProject[docs.rows[i].doc.project_id][docs.rows[i].doc._id] = docs.rows[i].doc;
      }
      this.loadingPendings = false;
      this.pendingsEvents.emit("pendingLoadingEnded");
    }).catch(err => {
      this.loadingPendings = false;
      this.pendingsEvents.emit("pendingLoadingEnded");
      this.report.report(err);
    });
  }

  getProjects() {
    if(this.loadingProjects){
      return new Promise(resolve => {
        this.projectEvents.subscribe(event => {
          resolve(this.fromObject(this.projects));
        });
      });
    }else {
      return Promise.resolve(this.fromObject(this.projects));
    }
  }

  deleteProject(id: string) {
    var doc = this.projects[id];
    delete this.projects[id];
    var arr_sourcesToDelete: any = [];
    for (var i = 0; i < this.sourcesByProject[id].length; i++) {
      delete this.sources[this.sourcesByProject[id][i]._id];
      arr_sourcesToDelete.push(this.sourcesByProject[id][i]);
    }
    delete this.sourcesByProject[id];


    for (var i = 0; i < arr_sourcesToDelete.length; i++) {
      this.sourceDB.remove(arr_sourcesToDelete[i]);
    }

    if (this.fromObject(this.projects).length == 0) {
      this.local.set("theresProjects", false);
    }

    return new Promise(resolve => {
      this.projectDB.remove(doc).then(result => {
        resolve(result);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  setProjectFromId(id: string, set: any) {
    return new Promise(resolve => {
      this.projectDB.put(set, id, this.projects[id]._rev).then(response => {
        set._rev = response.rev;
        this.projects[id] = set;
        resolve(response);
      }).catch(err =>{
        this.report.report(err);
        resolve(err);
      });
    });
  }

  getProjectFromId(id: string) {
    if(this.loadingProjects){
      return new Promise(resolve => {
        this.projectEvents.subscribe(event => {
          resolve(this.projects[id]);
        });
      });
    }else {
      return Promise.resolve(this.projects[id]);
    }
  }

  createProject(project: any) {
    this.loadingProjects = true;
    this.loadingSources = true;
    return new Promise(resolve => {
      this.projectDB.post(project).then(response => {
        this.sourcesByProject[response.id] = {};
        project._id = response.id;
        project._rev = response.rev;
        this.projects[response.id] = project;
        this.loadingProjects = false;
        this.loadingSources = false;
        this.projectEvents.emit("projectLoadingEnded");
        this.sourcesEvents.emit("sourceLoadingEnded");
        this.local.set("theresProjects", true);
        resolve(response);
      }).catch(function(err) {
        this.loadingProjects = false;
        this.loadingSources = false;
        this.projectEvents.emit("projectLoadingEnded");
        this.sourcesEvents.emit("sourceLoadingEnded");
        this.local.set("theresProjects", true);
        this.report.report(err);
        resolve(err);
      });
    });
  }

  getSourcesFromProjectId(id: string): Promise<Array<any>> {
    if(this.loadingSources){
      return new Promise(resolve => {
        this.sourcesEvents.subscribe(event => {
          resolve(this.fromObject(this.sourcesByProject[id]));
        });
      });
    }else {
      return Promise.resolve(this.fromObject(this.sourcesByProject[id]));
    }
  }

  getSourcesFromId(id: string) {
    if(this.loadingSources){
      return new Promise(resolve => {
        this.sourcesEvents.subscribe(event => {
          resolve(this.sources[id]);
        });
      });
    }else {
      return Promise.resolve(this.sources[id]);
    }
  }

  setSourceFromId(id: string, set: any) {
    return new Promise(resolve => {
      this.sourceDB.put(set, id, this.sources[id]._rev).then(response => {
        set._rev = response.rev;
        this.sources[id] = set;
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  createSource(source: any) {
    this.loadingSources = true;
    return new Promise(resolve => {
      this.sourceDB.post(source).then(response => {
        source._id = response.id;
        source._rev = response.rev;
        this.sources[response.id] = source;
        this.sourcesByProject[source.project_id][response.id] = source;
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        resolve(response);
      }).catch(function(err) {
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        this.report.report(err);
        resolve(err);
      });
    });
  }

  deleteSource(id: string) {
    let doc = this.sources[id];
    delete this.sources[id];
    delete this.sourcesByProject[doc.project_id][id];

    return new Promise(resolve => {
      this.sourceDB.remove(doc).then(result => {
        resolve(result);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  parseSources() {
    if(this.loadingSources) {
      return new Promise(resolve => {
        this.sourcesEvents.subscribe(() => {
          this.loadingSources = true;
          let arrSources: Array<any> = this.fromObject(this.sources);
          let source: any = {};
          for (var i = 0; i < arrSources.length; i++) {
            source[arrSources[i]._id] = this.parse.parse(arrSources[i]);
            if(i == arrSources.length - 1) {
              this.sourceDB.put(source[arrSources[i]._id]).then(response => {
                source[response.id]._rev = response.rev;
                this.sources[response.id] = source[response.id];
                this.sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
                this.loadingSources = false;
                this.sourcesEvents.emit("sourceLoadingEnded");
                resolve(true);
              });
            }else {
              this.sourceDB.put(source[arrSources[i]._id]).then(response => {
                source[response.id]._rev = response.rev;
                this.sources[response.id] = source[response.id];
                this.sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
              });
            }
          }
        });
      });
    }else {
      return new Promise(resolve => {
        this.loadingSources = true;
        let arrSources: Array<any> = this.fromObject(this.sources);
        let source = {};
        for (var i = 0; i < arrSources.length; i++) {
          source[arrSources[i]._id] = this.parse.parse(arrSources[i]);
          if(i == arrSources.length - 1) {
            this.sourceDB.put(source[arrSources[i]._id]).then(response => {
              source[response.id]._rev = response.rev;
              this.sources[response.id] = source[response.id];
              this.sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
              this.loadingSources = false;
              this.sourcesEvents.emit("sourceLoadingEnded");
              resolve(true);
            });
          }else {
            this.sourceDB.put(source[arrSources[i]._id]).then(response => {
              source[response.id]._rev = response.rev;
              this.sources[response.id] = source[response.id];
              this.sourcesByProject[source[response.id].project_id][response.id] = source[response.id];
            });
          }
        }
      });
    }
  }

  getPendingsFromProjectId(id: string) {
    if(this.loadingPendings){
      return new Promise(resolve => {
        this.pendingsEvents.subscribe(event => {
          resolve(this.fromObject(this.pendingsByProject[id]));
        });
      });
    }else {
      return Promise.resolve(this.fromObject(this.pendingsByProject[id]));
    }
  }

  createPending(pending: any) {
    this.loadingPendings = true;
    return new Promise(resolve => {
      this.pendingDB.post(pending).then(response => {
        pending._id = response.id;
        pending._rev = response.rev;
        this.pendings[response.id] = pending;
        this.pendingsByProject[pending.project_id][response.id] = pending;
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        resolve(response);
      }).catch(function(err) {
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        this.report.report(err);
        resolve(err);
      });
    });
  }

  deletePending(id: string) {
    let doc = this.pendings[id];
    delete this.pendings[id];
    delete this.pendingsByProject[doc.project_id][id];

    return new Promise(resolve => {
      this.pendingDB.remove(doc).then(result => {
        resolve(result);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  setPendingFromId(id: string, set: any) {
    return new Promise(resolve => {
      this.pendingDB.put(set, id, this.pendings[id]._rev).then(response => {
        set._rev = response.rev;
        this.pendings[id] = set;
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  getPendingNumber(id: string): Promise<number> {
    if (this.loadingPendings) {
      return new Promise(resolve => {
        this.pendingsEvents.subscribe(event => {
          let arr_pendings = this.fromObject(this.pendingsByProject[id]);
          resolve(arr_pendings.length ? arr_pendings.length : 0);
        });
      });
    }else {
      let arr_pendings = this.fromObject(this.pendingsByProject[id]);
      return Promise.resolve(arr_pendings.length ? arr_pendings.length : 0);
    }
  }

  fromObject(obj: Object): Array<any> {
    var ar: Array<any> = [];
    for(var item in obj){
        ar.push(obj[item]);
    }
    return ar;
  }
}
