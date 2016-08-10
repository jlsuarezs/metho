import {Injectable, EventEmitter} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';
import {Parse} from '../parse/parse';
import {Fetch} from '../fetch/fetch';
import {UserReport} from '../user-report/user-report';

import * as PouchDB from 'pouchdb';

@Injectable()
export class AppStorage {
  private theresProjects: boolean = false;
  private projectDB: any = null;
  private sourceDB: any = null;
  private pendingDB: any = null;
  private settingsDB: any = null;
  private local: any;
  private projects: Object = {};
  private sources: Object = {};
  private sourcesByProject: Object = {};
  private pendings: Object = {};
  private pendingsByProject: Object = {};
  private settings: any = {};

  private loadingProjects: boolean = true;
  private loadingSources: boolean = true;
  private loadingPendings: boolean = true;
  private loadingSettings: boolean = true;

  private projectEvents;
  private sourcesEvents;
  private pendingsEvents;
  private settingsEvents;

  constructor(public parse: Parse, public report: UserReport, public fetch: Fetch) {
    this.local = new Storage(LocalStorage);
    if(this.local.get("theresProjects") == null) {
      this.local.set("theresProjects", false);
    }
    this.theresProjects = this.local.get("theresProjects");

    this.projectEvents = new EventEmitter();
    this.sourcesEvents = new EventEmitter();
    this.pendingsEvents = new EventEmitter();
    this.settingsEvents = new EventEmitter();
  }

  init() {
    this.projectDB = new PouchDB("projects");
    this.sourceDB = new PouchDB("sources");
    this.pendingDB = new PouchDB("pendings");
    this.settingsDB = new PouchDB("settings");

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

    this.settingsDB.allDocs({include_docs: true}).then(docs => {
      for (var i = 0; i < docs.rows.length; i++) {
        this.settings[docs.rows[i].doc._id] = docs.rows[i].doc.value;
      }
      this.loadingSettings = false;
      this.settingsEvents.emit("settingsLoadingEnded");
    }).catch(err => {
      this.loadingSettings = false;
      this.settingsEvents.emit("settingsLoadingEnded");
      this.report.report(err);
    });
  }

  getProjects(): Promise<Array<any>> {
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
      let values = set;
      values._rev = this.projects[id]._rev;
      values._id = id;
      this.projectDB.put(values).then(response => {
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

  getSourceFromId(id: string) {
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
      let values = set;
      values._rev = this.sources[id]._rev;
      values._id = id;
      this.sourceDB.put(values).then(response => {
        set._rev = response.rev;
        set._id = response.id;
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

  getPendingsFromProjectId(id: string): Promise<Array<any>> {
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
        pending.isLoaded = false;
        pending.notAvailable = false;
        pending.data = {};
        if (!this.pendingsByProject[pending.project_id]) {
          this.pendingsByProject[pending.project_id] = {};
        }
        this.pendings[response.id] = pending;
        this.pendingsByProject[pending.project_id][response.id] = pending;
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        resolve(response);
      }).catch((err) => {
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
      let values = set;
      values._rev = this.pendings[id]._rev;
      values._id = id;
      this.pendingDB.put(values).then(response => {
        set._rev = response.rev;
        this.pendings[id] = set;
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  loadPendingsFromProjectId(id: string): void {
    if (navigator.onLine) {
      if(this.loadingPendings) {
        this.pendingsEvents.subscribe(() => {
          let arrPendings: Array<any> = this.fromObject(this.pendingsByProject[id]);
          for (var i = 0; i < arrPendings.length; i++) {
            if (!arrPendings[i].isLoaded) {
              let index = i;
              console.log(arrPendings[index]);
              this.fetch.fromISBN(arrPendings[i].isbn).then(data => {
                arrPendings[index].data = data;
                arrPendings[index].isLoaded = true;
                this.pendingDB.put(arrPendings[index]).then(response => {
                  arrPendings[index]._rev = response.rev;
                  this.pendings[response.id] = arrPendings[index];
                  this.pendingsByProject[arrPendings[index].project_id][response.id] = arrPendings[index];
                });
              }).catch(err => {
                if (err == 404) {
                  arrPendings[index].notAvailable = true;
                  arrPendings[index].isLoaded = true;
                  this.pendingDB.put(arrPendings[index]).then(response => {
                    arrPendings[index]._rev = response.rev;
                    this.pendings[response.id] = arrPendings[index];
                    this.pendingsByProject[arrPendings[index].project_id][response.id] = arrPendings[index];
                  });
                }
              });
            }
          }
        });
      }else {
        let arrPendings: Array<any> = this.fromObject(this.pendingsByProject[id]);
        for (var i = 0; i < arrPendings.length; i++) {
          if (!arrPendings[i].isLoaded) {
            let index = i;
            console.log(arrPendings[index]);
            this.fetch.fromISBN(arrPendings[i].isbn).then(data => {
              arrPendings[index].data = data;
              arrPendings[index].isLoaded = true;
              this.pendingDB.put(arrPendings[index]).then(response => {
                arrPendings[index]._rev = response.rev;
                this.pendings[response.id] = arrPendings[index];
                this.pendingsByProject[arrPendings[index].project_id][response.id] = arrPendings[index];
              });
            }).catch(err => {
              if (err == 404) {
                arrPendings[index].notAvailable = true;
                arrPendings[index].isLoaded = true;
                this.pendingDB.put(arrPendings[index]).then(response => {
                  arrPendings[index]._rev = response.rev;
                  this.pendings[response.id] = arrPendings[index];
                  this.pendingsByProject[arrPendings[index].project_id][response.id] = arrPendings[index];
                });
              }
            });
          }
        }
      }
    }
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

  getSettings(): Promise<any> {
    if (this.loadingSettings) {
      return new Promise(resolve => {
        this.settingsEvents.subscribe(event => {
          resolve(this.settings);
        });
      });
    }else {
      return Promise.resolve(this.settings);
    }
  }

  setSetting(key: string, value: any): void {
    this.settingsDB.get(key, {conflicts: true}).then(doc => {
      console.log(doc);
      doc.value = value;
      this.settingsDB.put(doc);
    }).catch(err => {
      this.settingsDB.put({ value: value, _id: key });
      console.log(err);
    });
  }

  fromObject(obj: Object): Array<any> {
    if (obj) {
      return Object.keys(obj).map(x => obj[x]);
    }else {
      return [];
    }
  }
}
