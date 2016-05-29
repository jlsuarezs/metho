import {Injectable, EventEmitter} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';
import 'rxjs/add/operator/map';

var PouchDB = require("pouchdb");

@Injectable()
export class AppStorage {
  theresProjects: Boolean = false;
  projectDB: Object = null;
  sourceDB: Object = null;
  pendingDB: Object = null;
  local: any;
  projects: Object = {};
  sources: Object = {};
  sourcesByProject: Object = {};
  pendings: Object = {};
  pendingsByProject: Object = {};

  loadingProjects: Boolean = true;
  loadingSources: Boolean = true;
  loadingPendings: Boolean = true;

  private projectEvents = new EventEmitter();
  private sourcesEvents = new EventEmitter();
  private pendingsEvents = new EventEmitter();


  constructor() {
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
        // ReportUser.report(err);
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
      // ReportUser.report(err);
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
      // ReportUser.report(err);
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

  }

  setProjectFromId(id: string, set: Object) {

  }

  getProjectFromId(id: string) {

  }

  createProject(project: Object) {

  }

  getSourcesFromProjectId(id: string) {

  }

  getSourcesFromId(id: string) {

  }

  setSourceFromId(id: string, set: Object) {

  }

  createSource(source: Object) {

  }

  deleteSource(id: string) {

  }

  parseSources() {

  }

  getPendings() {
    // Deprecated
  }

  getPendingsFromProjectId(id: string) {

  }

  createPending(pending: Object) {

  }

  deletePending(id: string) {

  }

  setPendingFromId(id: string, set: Object) {

  }

  getPendingNumber(id: string) {

  }

  fromObject(obj: Object) {
    var ar = [];
    for(var item in obj){
        ar.push(obj[item]);
    }
    return ar;
  }
}
