import {NavController} from 'ionic-angular';
import {Component} from '@angular/core';
import {SafariViewController} from 'ionic-native';

import {LicensePage} from '../license/license';

@Component({
  templateUrl: 'build/pages/attributions/attributions.html'
})
export class AttributionsPage {
  constructor(public nav: NavController) {
    SafariViewController.warmUp();
  }

  showLicense(type: string) {
    this.nav.push(LicensePage, { type: type });
  }

  openWebsite(url: string) {
    SafariViewController.show({ url: url });
  }
}
