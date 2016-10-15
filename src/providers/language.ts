import { Injectable } from "@angular/core";

import { Config } from "ionic-angular";
import { Globalization } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { AppStorage } from "./app-storage";
import { Settings } from "./settings";

import moment from "moment";
import "moment/src/locale/fr";
import "moment/src/locale/en-ca";
import "moment/src/locale/es";


@Injectable()
export class Language {
  public currentLang: string;

  constructor(
    public config: Config,
    public translate: TranslateService,
    public storage: AppStorage,
    public settings: Settings,
  ) {}

  init() {
    this.translate.setDefaultLang("en");
    this.settings.getAsync("overideLang").then(overideLang => {
      if (overideLang == "") {
        Globalization.getPreferredLanguage().then(lang => {
          let code = lang.value.split("-")[0];

          this.translate.use(code);
          this.translate.get("BACK_BUTTON").subscribe(back => {
            this.config.set("ios", "backButtonText", back);
          });

          let subscription = this.translate.onLangChange.subscribe(() => {
            subscription.unsubscribe();
            if (code != this.settings.get("lastLang")) {
              this.storage.parseSources();
            }
            this.settings.set("lastLang", code);
          });
          moment.locale(code);
          this.currentLang = code;
        }).catch(err => {
          this.translate.use("fr");
          this.translate.get("BACK_BUTTON").subscribe(back => {
            this.config.set("ios", "backButtonText", back);
          });
          moment.locale("fr");
          this.currentLang = "fr";
        });
      }else {
        this.translate.use(overideLang);
        this.translate.get("BACK_BUTTON").subscribe(back => {
          this.config.set("ios", "backButtonText", back);
        });
        moment.locale(overideLang);
        this.currentLang = overideLang;
      }
    });
  }

  getMoment() {
    return moment;
  }

  change(lang: string) {
    this.settings.set("overideLang", lang);
    this.init();
    let subscription = this.translate.onLangChange.subscribe(() => {
      subscription.unsubscribe();
      this.storage.parseSources();
    });
  }

  current(): string {
    return this.currentLang;
  }
}
