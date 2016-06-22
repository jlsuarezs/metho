import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'build/pages/license/license.html',
  pipes: [TranslatePipe],
})
export class LicensePage {
  public type: string = "";

  constructor(public nav: NavController, public params: NavParams) {
    this.type = this.params.get('type');
  }
}
