import {Injectable} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';

import {Config} from 'ionic-angular';

import {AppStorage} from '../app-storage/app-storage';
import {ThreeDeeTouchProvider} from '../3d-touch/3d-touch';
import {Settings} from '../settings/settings';

import {Globalization} from 'ionic-native';

import * as moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import 'moment/locale/es';
// var numeral = require('numeral');
// import 'numeral/languages/fr';
// import 'numeral/languages/en-gb';
// import 'numeral/languages/es';


@Injectable()
export class Language {
  public currentLang: string;

  constructor(public settings: Settings, public translate: TranslateService, public config: Config, public storage: AppStorage, public threeDee: ThreeDeeTouchProvider) {}

  init() {
    this.translate.setDefaultLang('en');
    if (this.settings.get('overideLang') == "") {
      Globalization.getPreferredLanguage().then(lang => {
        let code = lang.value.split("-")[0];

        this.translate.use(code);
        this.translate.get("BACK_BUTTON").subscribe(back => {
          this.config.set('ios', 'backButtonText', back);
        });
        moment.locale(code);
        this.currentLang = code;
        if (code != this.settings.get('lastLang')) {
          this.storage.parseSources();
        }
        this.settings.set('lastLang', code);
        // numeral.language(code);
      }).catch(err => {
        this.translate.use("fr");
        this.translate.get("BACK_BUTTON").subscribe(back => {
          this.config.set('ios', 'backButtonText', back);
        });
        moment.locale("fr");
        this.currentLang = "fr";
        // numeral.language("fr");
      });
    }else {
      this.translate.use(this.settings.get('overideLang'));
      this.translate.get("BACK_BUTTON").subscribe(back => {
        this.config.set('ios', 'backButtonText', back);
      });
      moment.locale(this.settings.get('overideLang'));
      this.currentLang = this.settings.get('overideLang');
      // numeral.language(this.settings.get('overideLang'));
    }
  }

  getMoment() {
    return moment;
  }

  // getNumeral() {
  //   return numeral;
  // }

  change(lang: string) {
    this.settings.set('overideLang', lang);
    this.init();
    this.translate.onLangChange.subscribe(() => {
      this.storage.parseSources();
      this.threeDee.update();
    });
  }

  current(): string {
    return this.currentLang;
  }
}