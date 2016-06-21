import {NavController} from 'ionic-angular';
import {Component} from '@angular/core';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {References} from '../../providers/references/references';
import {Settings} from '../../providers/settings/settings';

import {ReferencesDetailPage} from '../references-detail/references-detail';


@Component({
  templateUrl: 'build/pages/references/references.html',
  pipes: [TranslatePipe]
})
export class ReferencesPage {
  public references: any[];
  public advanced: boolean;

  constructor(public nav: NavController, public settings: Settings) {
    this.references = References.getReferences();
    this.advanced = this.settings.get('advanced');
  }

  goToReferenceDetailPage(id: number) {
    this.nav.push(ReferencesDetailPage, {
      id: id
    })
  }
}
