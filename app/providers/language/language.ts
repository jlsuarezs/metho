import {Injectable} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import * as moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en';
import 'moment/locale/es';
var numeral = require('numeral');
import 'numeral/min/languages.min';

import {Settings} from '../settings/settings';

import {Globalization} from 'ionic-native';

@Injectable()
export class Language {

  constructor(public settings: Settings, public translate: TranslateService) {}

  init() {
    if (this.settings.get('overideLang') == "") {
      Globalization.getPreferredLanguage().then(lang => {
        this.translate.use(lang.value);
        moment.locale(lang.value);
        numeral.language(lang.value);
      });
    }else {
      this.translate.use(this.settings.get('overideLang'));
      moment.locale(this.settings.get('overideLang'));
      numeral.language(this.settings.get('overideLang'));
    }
  }

  getMoment() {
    return moment;
  }

  getNumeral() {
    return numeral;
  }

  change(lang: string) {
    this.settings.set('overideLang', lang);
    this.init();
  }
}
