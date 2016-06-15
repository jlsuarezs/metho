import {Injectable} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Globalization} from 'ionic-native';
import * as moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import 'moment/locale/es';
// var numeral = require('numeral');
// import 'numeral/languages/fr';
// import 'numeral/languages/en-gb';
// import 'numeral/languages/es';

import {Settings} from '../settings/settings';


@Injectable()
export class Language {
  public currentLang: string;

  constructor(public settings: Settings, public translate: TranslateService) {}

  init() {
    this.translate.setDefaultLang('en');
    if (this.settings.get('overideLang') == "") {
      Globalization.getPreferredLanguage().then(lang => {
        let code = lang.value.split("-")[0];
        this.translate.use(code);
        moment.locale(code);
        this.currentLang = code;
        // numeral.language(code);
      }).catch(err => {
        this.translate.use("fr");
        moment.locale("fr");
        this.currentLang = "fr";
        // numeral.language("fr");
      });
    }else {
      this.translate.use(this.settings.get('overideLang'));
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
  }

  current(): string {
    return this.currentLang;
  }
}
