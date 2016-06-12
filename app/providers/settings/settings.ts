import {Injectable} from '@angular/core';
import {LocalStorage, Storage} from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class Settings {
  public localStorage: LocalStorage;
  public settings: any = {};
  public defaults: any;
  public loaded: boolean = false;

  constructor() {
    this.localStorage = new Storage(LocalStorage);

    this.defaults = {
      advanced: false,
      askForOrder: true,
      defaultOrder: "alpha",
      scanBoardingDone: false,
      firstname: "",
      lastname: "",
      overideLang: "",
      lastLang: "",
      firstRun: true
    };

    this.load();
  }

  load() {
    for (var index in this.defaults) {
      if (this.defaults.hasOwnProperty(index) && index != "firstRun") {
        let currentIndex = index;
        this.localStorage.get("setting-" + index).then(res => {
          if (res == null) {
            this.settings[currentIndex] = this.defaults[currentIndex];
            this.localStorage.set("setting-" + currentIndex, this.defaults[currentIndex]);
          }else {
            if (res == "true") {
              this.settings[currentIndex] = true;
            }else if (res == "false") {
              this.settings[currentIndex] = false;
            }else {
              this.settings[currentIndex] = res;
            }
          }
        });
      }else if (index == "firstRun") {
        let currentIndex = index;
        this.localStorage.get("setting-" + index.toString()).then(res => {
          if (res == null) {
            this.settings[currentIndex] = this.defaults[currentIndex];
            this.localStorage.set("setting-" + currentIndex, this.defaults[currentIndex]);
          }else {
            if (res == "true") {
              this.settings[currentIndex] = true;
            }else if (res == "false") {
              this.settings[currentIndex] = false;
            }else {
              this.settings[currentIndex] = res;
            }
          }
          this.loaded = true;
        });
      }
    }
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
