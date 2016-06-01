import {Page, NavController, Modal, Alert, List} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {AppStorage} from '../../providers/app-storage/app-storage.ts';

import {SourcesPage} from '../sources/sources';
import {ProjectModalPage} from '../project-modal/project-modal';

@Page({
  templateUrl: 'build/pages/projects/projects.html',
  pipes: [TranslatePipe]
})
export class ProjectsPage {
  public projects: Array<any> = [];
  public loading: Boolean = true;
  @ViewChild(List) list: List;

  constructor(public nav: NavController, public translate: TranslateService, public storage: AppStorage) {
    this.translate = translate;
    this.nav = nav;
    this.loadProjects();
  }

  loadProjects() {
    this.storage.getProjects().then(projects => {
      this.projects = projects;
      this.projects.sort(function(a, b) {
        if (a.title && b.title) {
          return a.title.localeCompare(b.title);
        } else if (a.title) {
          return a.title.localeCompare(b.parsedSource);
        } else if (b.title) {
          return a.parsedSource.localeCompare(b.title);
        }
      });
      this.loading = false;
    });
  }

  createProject() {
    let modal = Modal.create(ProjectModalPage, {
      previous: null
    });

    modal.onDismiss(data => {
      this.loadProjects();
    });

    this.nav.present(modal);
  }

  editProject(project: any) {
    let modal = Modal.create(ProjectModalPage, {
      previous: project
    });

    modal.onDismiss(data => {
      this.list.closeSlidingItems();
      this.loadProjects();
    });

    this.nav.present(modal);
  }

  deleteProject(project: any) {
    this.translate.get(['PROJECT.TAB.POPUP.DELETE_PROJECT_TITLE', 'PROJECT.TAB.POPUP.DELETE_PROJECT', 'PROJECT.TAB.POPUP.CANCEL', 'PROJECT.TAB.POPUP.DELETE']).subscribe(translations => {
      let confirm = Alert.create({
        title: translations['PROJECT.TAB.POPUP.DELETE_PROJECT_TITLE'],
        message: translations['PROJECT.TAB.POPUP.DELETE_PROJECT'],
        buttons: [
          {
            text: translations['PROJECT.TAB.POPUP.CANCEL'],
            handler: () => {
              this.list.closeSlidingItems();
            }
          },
          {
            text: translations['PROJECT.TAB.POPUP.DELETE'],
            handler: () => {
              this.storage.deleteProject(project._id);
              let index = this.projects.indexOf(project);
              if(index > -1) {
                this.projects.splice(index, 1);
              }
            }
          }
        ]
      });
      this.nav.present(confirm);
    });
  }

  openProjectDetail(project: any) {
    this.nav.push(SourcesPage, {
      id: project._id
    });
  }
}
