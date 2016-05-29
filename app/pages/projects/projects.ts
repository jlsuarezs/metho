import {Page, NavController} from 'ionic-angular';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

import {SourcesPage} from '../sources/sources';

@Page({
  templateUrl: 'build/pages/projects/projects.html',
  pipes: [TranslatePipe]
})
export class ProjectsPage {
  public projects: Array<Object>;
  public loading: Boolean;

  constructor(public nav: NavController, public translate: TranslateService) {
    this.translate = translate;
    this.nav = nav;
    this.projects = [
      // {
      //   name: 'allo',
      //   matter: 'comment ça va?',
      //   id: '123456'
      // }
    ];
    this.loading = false;
  }

  openProjectDetail(project: Object) {
    this.nav.push(SourcesPage);
  }
}
