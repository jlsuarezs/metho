import { ViewChild, Component } from '@angular/core';

import { NavController, ModalController, AlertController, List } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { ProjectModalPage } from '../project-modal/project-modal';
import { SourcesPage } from '../sources/sources';

import { AppStorage } from '../../providers/app-storage/app-storage';


@Component({
  templateUrl: 'build/pages/projects/projects.html'
})
export class ProjectsPage {
  public projects: any[] = [];
  public loading: Boolean = true;
  @ViewChild(List) list: List;

  constructor(public nav: NavController, public alertCtrl: AlertController, public modalCtrl: ModalController, public translate: TranslateService, public storage: AppStorage) {
    this.loadProjects();
  }

  loadProjects() {
    this.storage.getProjects().then(projects => {
      this.projects = projects;
      this.projects.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      this.loading = false;
    });
  }

  createProject() {
    let modal = this.modalCtrl.create(ProjectModalPage, {
      previous: null
    }, {
      enableBackdropDismiss: false
    });

    modal.onWillDismiss(data => {
      this.loadProjects();
    });

    modal.present();
  }

  editProject(project: Project) {
    let modal = this.modalCtrl.create(ProjectModalPage, {
      previous: project
    }, {
      enableBackdropDismiss: false
    });

    modal.onWillDismiss(data => {
      this.list.closeSlidingItems();
      this.loadProjects();
    });

    modal.present();
  }

  deleteProject(project: Project) {
    this.translate.get(['PROJECT.TAB.POPUP.DELETE_PROJECT_TITLE', 'PROJECT.TAB.POPUP.DELETE_PROJECT', 'PROJECT.TAB.POPUP.CANCEL', 'PROJECT.TAB.POPUP.DELETE']).subscribe(translations => {
      let confirm = this.alertCtrl.create({
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
      confirm.present();
    });
  }

  openProjectDetail(project: Project) {
    this.nav.push(SourcesPage, {
      id: project._id
    });
  }
}
