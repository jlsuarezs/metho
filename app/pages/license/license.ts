import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';

@Component({
  templateUrl: 'build/pages/license/license.html'
})
export class LicensePage {
  public type: string = "";

  constructor(public nav: NavController, public params: NavParams) {
    this.type = this.params.get('type');
  }
}
