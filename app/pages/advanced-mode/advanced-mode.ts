import {NavController} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslateService} from 'ng2-translate/ng2-translate';

import {AdvancedMode} from '../../providers/advanced-mode/advanced-mode';

@Component({
  templateUrl: 'build/pages/advanced-mode/advanced-mode.html'
})
export class AdvancedModePage {
  public isAdvanced: boolean = false;
  public price: string = "1,39$";

  constructor(public nav: NavController, public advanced: AdvancedMode, public translate: TranslateService) {
    this.isAdvanced = this.advanced.isEnabled();
    if (this.advanced.hasLoaded) {
      this.price = this.advanced.price;
    }else {
      this.advanced.loadEvents.subscribe(() => {
        this.price = this.advanced.price;
      });
    }
  }

  enable() {
    this.advanced.enable().then(() => {
      this.nav.pop();
    }).catch(err => {

    });
  }

  restore() {
    this.advanced.restore().then(() => {
      this.nav.pop();
    }).catch((err) => {

    });
  }
}
