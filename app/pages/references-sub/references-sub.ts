import {Page, NavController, NavParams} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {References} from '../../providers/references/references';

@Page({
  templateUrl: 'build/pages/references-sub/references-sub.html',
  pipes: [TranslatePipe]
})
export class ReferencesSubPage {
  public name: string = '';
  public text: string = '';

  constructor(public nav: NavController, public params: NavParams) {
    let index = this.params.get('id');
    let subIndex = this.params.get('subId');
    let reference = References.getReferences()[index].subPages[subIndex];

    this.name = reference.name;
    this.text = reference.text;
  }
}
