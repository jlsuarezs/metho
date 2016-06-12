import {Page, NavController, NavParams} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {References} from '../../providers/references/references';
import {ReferencesSubPage} from '../references-sub/references-sub';

@Page({
  templateUrl: 'build/pages/references-detail/references-detail.html',
  pipes: [TranslatePipe]
})
export class ReferencesDetailPage {
  public name: string = '';
  public text: string = '';
  public entries: any[] = [];
  public id: string;

  constructor(public nav: NavController, public params: NavParams) {
    let object = References.getReferences();
    this.id = this.params.get('id');

    this.text = object[this.id].text;
    this.entries = object[this.id].subPages;
    this.name = object[this.id].name
  }

  goToReferenceSubPage(id: number) {
    this.nav.push(ReferencesSubPage, {
      id: this.id,
      subId: id
    });
  }
}
