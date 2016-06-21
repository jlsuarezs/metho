import {NavController} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {LicensePage} from '../license/license';

@Component({
  templateUrl: 'build/pages/attributions/attributions.html',
  pipes: [TranslatePipe]
})
export class AttributionsPage {
  constructor(public nav: NavController) {}

  showLicense(type: string) {
    this.nav.push(LicensePage, { type: type });
  }
}
