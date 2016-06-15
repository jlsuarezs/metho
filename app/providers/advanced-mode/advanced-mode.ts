import {Injectable} from '@angular/core';

import {Settings} from '../settings/settings';

import {TranslateService} from 'ng2-translate/ng2-translate';

@Injectable()
export class AdvancedMode {

  constructor(public translate: TranslateService, public settings: Settings) {}

  enable() {
    this.settings.set('advanced', true);
    return true;
  }

  disable() {
    this.settings.set('advanced', false);
  }
}
