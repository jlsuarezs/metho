import {Injectable} from '@angular/core';
import {LocalStorage, Storage} from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class Settings {
  public localStorage: LocalStorage;
  public settings: any;

  constructor() {
    this.localStorage = new Storage(LocalStorage);
    this.settings = {};

    this.localStorage.get("setting-advanced").then(res => {
      if (res == null) {
        this.settings.advanced = false;
        this.localStorage.set("setting-advanced", "false");
      }else {
        this.settings.advanced = res;
      }
    });
    this.localStorage.get("setting-askForOrder").then(res => {
      if (res == null) {
        this.settings.askForOrder = true;
        this.localStorage.set("setting-askForOrder", "true");
      }else {
        this.settings.askForOrder = res;
      }
    });
    this.localStorage.get("setting-defaultOrder").then(res => {
      if (res == null) {
        this.settings.defaultOrder = "alpha";
        this.localStorage.set("setting-defaultOrder", "alpha");
      }else {
        this.settings.defaultOrder = res;
      }
    });
    this.localStorage.get("setting-scanBoardingDone").then(res => {
      if (res == null) {
        this.settings.scanBoardingDone = false;
        this.localStorage.set("setting-scanBoardingDone", "false");
      }else {
        this.settings.scanBoardingDone = res;
      }
    });
    this.localStorage.get("setting-firstname").then(res => {
      if (res == null) {
        this.settings.firstname = "";
        this.localStorage.set("setting-firstname", "");
      }else {
        this.settings.firstname = res;
      }
    });
    this.localStorage.get("setting-lastname").then(res => {
      if (res == null) {
        this.settings.lastname = "";
        this.localStorage.set("setting-lastname", "");
      }else {
        this.settings.lastname = res;
      }
    });
    this.localStorage.get("setting-overideLang").then(res => {
      if (res == null) {
        this.settings.overideLang = "";
        this.localStorage.set("setting-overideLang", "");
      }else {
        this.settings.overideLang = res;
      }
    });
    this.localStorage.get("setting-lastLang").then(res => {
      if (res == null) {
        this.settings.lastLang = "";
        this.localStorage.set("setting-lastLang", "");
      }else {
        this.settings.lastLang = res;
      }
    });
    this.localStorage.get("setting-firstRun").then(res => {
      if (res == null) {
        this.settings.firstRun = true;
        this.localStorage.set("setting-firstRun", "true");
      }else {
        this.settings.firstRun = res;
      }
    });

    setTimeout(() => {
      for (var key in this.settings) {
        if (this.settings.hasOwnProperty(key)) {
          if (this.settings[key] == "true") {
            this.settings[key] = true;
          }else if (this.settings[key] == "false") {
            this.settings[key] = false;
          }
        }
      }
    }, 50);
  }

  get(key: string): any {
    return this.settings[key];
  }

  set(key: string, set: boolean|string): void {
    this.settings[key] = set;
    this.localStorage.set("setting-" + key, set.toString());
  }

  getAll(): any {
    return this.settings;
  }
}
