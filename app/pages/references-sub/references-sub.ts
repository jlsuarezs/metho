import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {References} from '../../providers/references/references';

@Component({
  templateUrl: 'build/pages/references-sub/references-sub.html',
  pipes: [TranslatePipe]
})
export class ReferencesSubPage {
  public name: string = '';
  public text: string = '';

  constructor(public nav: NavController, public params: NavParams, public references: References) {
    let index = this.params.get('id');
    let subIndex = this.params.get('subId');
    this.references.load().then(data => {
      let reference = data[index].subPages[subIndex];
      this.name = reference.name;
      this.text = reference.text;
    });
  }
}
