import {Injectable, EventEmitter} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';
import {Parse} from '../parse/parse';
import {Fetch} from '../fetch/fetch';
import {UserReport} from '../user-report/user-report';

declare const require: any;

const PouchDB = require('pouchdb');

@Injectable()
export class AppStorage {
  private theresProjects: boolean = false;
  private projectDB: any = null;
  private sourceDB: any = null;
  private pendingDB: any = null;
  private settingsDB: any = null;
  private local: any;
  private projects: Map<string, any> = <Map<string, any>>new Map();
  private sources: Map<string, any> = <Map<string, any>>new Map();
  private sourcesByProject: Map<string, any> = <Map<string, Map<string, any>>>new Map();
  private pendings: Map<string, any> = <Map<string, any>>new Map();
  private pendingsByProject: Map<string, any> = <Map<string, Map<string, any>>>new Map();
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
    this.projectDB = new PouchDB("projects", { adapter: "websql" });
    this.sourceDB = new PouchDB("sources", { adapter: "websql" });
    this.pendingDB = new PouchDB("pendings", { adapter: "websql" });
    this.settingsDB = new PouchDB("settings", { adapter: "websql" });

    if (this.theresProjects) {
      this.projectDB.allDocs({include_docs: true}).then(docs => {
        docs.rows.forEach((value) => {
          this.projects.set(value.doc._id, value.doc);
          if (!this.sourcesByProject.has(value.doc._id)) {
            this.sourcesByProject.set(value.doc._id, new Map());
          }

          if (!this.pendingsByProject.has(value.doc._id)) {
            this.pendingsByProject.set(value.doc._id, new Map());
          }
        });
        this.loadingProjects = false;
        this.projectEvents.emit("projectLoadingEnded");
      }).catch(err => {
        this.loadingProjects = false;
        this.projectEvents.emit("projectLoadingEnded");
        this.report.report(err);
      });
    }

    this.sourceDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach(value => {
        this.sources.set(value.doc._id, value.doc);
        if (!this.sourcesByProject.has(value.doc.project_id)) {
          this.sourcesByProject.set(value.doc.project_id, new Map());
        }
        this.sourcesByProject.set(value.doc.project_id, this.sourcesByProject.get(value.doc.project_id).set(value.doc._id, value.doc));
      });
      this.loadingSources = false;
      this.sourcesEvents.emit("sourceLoadingEnded");
    }).catch(err => {
      this.loadingSources = false;
      this.sourcesEvents.emit("sourceLoadingEnded");
      this.report.report(err);
    });

    this.pendingDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach(value => {
        this.pendings.set(value.doc._id, value.doc);
        if (!this.pendingsByProject.has(value.doc.project_id)) {
          this.pendingsByProject.set(value.doc.project_id, new Map());
        }
        this.pendingsByProject.set(value.doc.project_id, this.pendingsByProject.get(value.doc.project_id).set(value.doc._id, value.doc));
      });
      this.loadingPendings = false;
      this.pendingsEvents.emit("pendingLoadingEnded");
    }).catch(err => {
      this.loadingPendings = false;
      this.pendingsEvents.emit("pendingLoadingEnded");
      this.report.report(err);
    });

    this.settingsDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach(value => {
        this.settings[value.doc._id] = value.doc.value;
      });
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
        let subscription = this.projectEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(Array.from(this.projects.values()));
        });
      });
    }else {
      return Promise.resolve(Array.from(this.projects.values()));
    }
  }

  deleteProject(id: string) {
    this.loadingProjects = true;
    var doc = this.projects.get(id);
    this.projects.delete(id);
    let deletePromises = [];
    // Remove the sources
    this.sourcesByProject.get(id).forEach(source => {
      deletePromises.push(this.deleteSource(source._id));
    });
    // Delete this.sourcesByProject object for the deleted project
    Promise.all(deletePromises).then(value => {
      this.sourcesByProject.delete(id);
      this.loadingProjects = true;
      this.projectEvents.emit("projectLoadingEnded");
    });

    if (this.projects.size == 0) {
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
    this.loadingProjects = true;
    return new Promise(resolve => {
      let values = set;
      values._rev = this.projects.get(id)._rev;
      values._id = id;
      this.projectDB.put(values).then(response => {
        set._rev = response.rev;
        this.projects.set(id, set);
        this.loadingProjects = false;
        this.projectEvents.emit("projectLoadingEnded");
        resolve(response);
      }).catch(err =>{
        this.loadingProjects = false;
        this.projectEvents.emit("projectLoadingEnded");
        this.report.report(err);
        resolve(err);
      });
    });
  }

  getProjectFromId(id: string) {
    if(this.loadingProjects){
      return new Promise(resolve => {
        let subscription = this.projectEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(this.projects.get(id));
        });
      });
    }else {
      return Promise.resolve(this.projects.get(id));
    }
  }

  createProject(project: any) {
    this.loadingProjects = true;
    this.loadingSources = true;
    return new Promise(resolve => {
      this.projectDB.post(project).then(response => {
        this.sourcesByProject.set(response.id, new Map());
        this.pendingsByProject.set(response.id, new Map());
        project._id = response.id;
        project._rev = response.rev;
        this.projects.set(response.id, project);
        this.loadingProjects = false;
        this.loadingSources = false;
        this.projectEvents.emit("projectLoadingEnded");
        this.sourcesEvents.emit("sourceLoadingEnded");
        this.local.set("theresProjects", true);
        resolve(response);
      }).catch((err) => {
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
        let subscription = this.sourcesEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(Array.from(this.sourcesByProject.get(id).values()));
        });
      });
    }else {
      return Promise.resolve(Array.from(this.sourcesByProject.get(id).values()));
    }
  }

  getSourceFromId(id: string) {
    if(this.loadingSources){
      return new Promise(resolve => {
        let subscription = this.sourcesEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(this.sources.get(id));
        });
      });
    }else {
      return Promise.resolve(this.sources.get(id));
    }
  }

  setSourceFromId(id: string, set: any) {
    this.loadingSources = true;
    return new Promise(resolve => {
      set._rev = this.sources.get(id)._rev;
      set._id = id;
      this.sourceDB.put(set).then(response => {
        set._rev = response.rev;
        set._id = response.id;
        this.sources.set(id, set);
        this.sourcesByProject.get(set.project_id).set(id, set);
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
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
        this.sources.set(response.id, source); this.sourcesByProject.get(source.project_id).set(response.id, source);
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        resolve(response);
      }).catch(err => {
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        this.report.report(err);
        resolve(err);
      });
    });
  }

  deleteSource(id: string) {
    this.loadingSources = true;
    let doc = this.sources.get(id);
    this.sources.delete(id);
    this.sourcesByProject.get(doc.project_id).delete(id);

    return new Promise(resolve => {
      this.sourceDB.remove(doc).then(result => {
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        resolve(result);
      }).catch(err => {
        this.report.report(err);
        this.loadingSources = false;
        this.sourcesEvents.emit("sourceLoadingEnded");
        resolve(err);
      });
    });
  }

  parseSources() {
    return new Promise(resolve => {
      if(this.loadingSources) {
        let subscription = this.sourcesEvents.subscribe(() => {
          subscription.unsubscribe();
          this.loadingSources = true;
          let promises: Promise<any>[] = [];
          this.sources.forEach((source) => {
            let parsedSource = this.parse.parse(source);
            promises.push(this.setSourceFromId(parsedSource._id, parsedSource));
          });
          Promise.all(promises).then(() => {
            this.loadingSources = false;
            this.sourcesEvents.emit("sourceLoadingEnded");
            resolve(true);
          });
        });
      }else {
        this.loadingSources = true;
        let promises: Promise<any>[] = [];
        this.sources.forEach((source) => {
          let parsedSource = this.parse.parse(source);
          promises.push(this.setSourceFromId(parsedSource._id, parsedSource));
        });
        Promise.all(promises).then(() => {
          this.loadingSources = false;
          this.sourcesEvents.emit("sourceLoadingEnded");
          resolve(true);
        });
      }
    });
  }

  getPendingsFromProjectId(id: string): Promise<Array<any>> {
    if(this.loadingPendings){
      return new Promise(resolve => {
        let subscription = this.pendingsEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(Array.from(this.pendingsByProject.get(id).values()));
        });
      });
    }else {
      return Promise.resolve(Array.from(this.pendingsByProject.get(id).values()));
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
        this.pendings.set(response.id, pending); this.sourcesByProject.get(pending.project_id).set(pending._id, pending);
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
    this.loadingPendings = true;
    let doc = this.pendings.get(id);
    this.pendings.delete(id);
    this.pendingsByProject.get(doc.project_id).delete(doc._id);

    return new Promise(resolve => {
      this.pendingDB.remove(doc).then(result => {
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        resolve(result);
      }).catch(err => {
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        this.report.report(err);
        resolve(err);
      });
    });
  }

  setPendingFromId(id: string, set: any) {
    this.loadingPendings = true;
    return new Promise(resolve => {
      let values = set;
      values._rev = this.pendings.get(id)._rev;
      values._id = id;
      this.pendingDB.put(values).then(response => {
        set._rev = response.rev;
        this.pendings.set(id, set);
        this.pendingsByProject.get(set.project_id).set(set._id, set);
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        this.loadingPendings = false;
        this.pendingsEvents.emit("pendingLoadingEnded");
        resolve(err);
      });
    });
  }

  loadPendingsFromProjectId(id: string): void {
    if (navigator.onLine) {
      if(this.loadingPendings) {
        let subscription = this.pendingsEvents.subscribe(() => {
          subscription.unsubscribe();
          this.pendings.forEach(pending => {
            if (!pending.isLoaded) {
              this.fetch.fromISBN(pending.isbn).then(data => {
                pending.data = data;
                pending.isLoaded = true;
                this.setPendingFromId(pending._id, pending);
              }).catch(err => {
                if (err == 404) {
                  pending.notAvailable = true;
                  pending.isLoaded = true;
                  this.setPendingFromId(pending._id, pending);
                }
              });
            }
          });
        });
      }else {
        this.pendings.forEach(pending => {
          if (!pending.isLoaded) {
            this.fetch.fromISBN(pending.isbn).then(data => {
              console.log(data);
              pending.data = data;
              pending.isLoaded = true;
              this.setPendingFromId(pending._id, pending);
            }).catch(err => {
              if (err == 404) {
                pending.notAvailable = true;
                pending.isLoaded = true;
                this.setPendingFromId(pending._id, pending);
              }
            });
          }
        });
      }
    }
  }

  getPendingNumber(id: string): Promise<number> {
    if (this.loadingPendings) {
      return new Promise(resolve => {
        let subscription = this.pendingsEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(this.pendingsByProject.get(id).size);
        });
      });
    }else {
      return Promise.resolve(this.pendingsByProject.get(id).size);
    }
  }

  getSettings(): Promise<any> {
    if (this.loadingSettings) {
      return new Promise(resolve => {
        let subscription = this.settingsEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(this.settings);
        });
      });
    }else {
      return Promise.resolve(this.settings);
    }
  }

  setSetting(key: string, value: any): void {
    this.loadingSettings = true;
    this.settingsDB.get(key).then(doc => {
      doc.value = value;
      this.settingsDB.put(doc);
      this.loadingSettings = false;
      this.settingsEvents.emit("settingsLoadingEnded");
    }).catch(err => {
      if (err.status == 404) {
        this.settingsDB.put({ value: value, _id: key });
      }else {
        this.report.report(err);
      }
      this.loadingSettings = false;
      this.settingsEvents.emit("settingsLoadingEnded");
    });
  }
}
