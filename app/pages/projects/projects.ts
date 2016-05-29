import {Page, NavController} from 'ionic-angular';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {AppStorage} from '../../providers/app-storage/app-storage.ts';

import {SourcesPage} from '../sources/sources';

@Page({
  templateUrl: 'build/pages/projects/projects.html',
  pipes: [TranslatePipe]
})
export class ProjectsPage {
  public projects: Array<Object> = [];
  public loading: Boolean = true;

  constructor(public nav: NavController, public translate: TranslateService, public storage: AppStorage) {
    this.translate = translate;
    this.nav = nav;
    this.storage.getProjects().then(projects => {
      this.projects = projects;
      this.loading = false;
    });
  }

  openProjectDetail(project: Object) {
    this.nav.push(SourcesPage);
  }
}
