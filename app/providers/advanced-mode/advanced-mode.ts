import {Injectable} from '@angular/core';

import {Settings} from '../settings/settings';
import {ThreeDeeTouchProvider} from '../3d-touch/3d-touch';

import {TranslateService} from 'ng2-translate/ng2-translate';

@Injectable()
export class AdvancedMode {

  constructor(public translate: TranslateService, public settings: Settings, public threeDee: ThreeDeeTouchProvider) {}

  enable(): Promise<void> {
    this.settings.set('advanced', true);
    this.threeDee.update();
    return Promise.resolve();
  }

  disable() {
    this.settings.set('advanced', false);
    this.threeDee.update();
  }

  isEnabled() {
    return this.settings.get('advanced');
  }
}
