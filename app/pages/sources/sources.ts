import {Page, NavController, NavParams, ActionSheet, Modal, Alert, List} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {SocialSharing} from 'ionic-native';

import {SourcePage} from '../source/source';
import {SourceModalPage} from '../source-modal/source-modal';
import {PendingsPage} from '../pendings/pendings';
import {AppStorage} from '../../providers/app-storage/app-storage';

@Page({
  templateUrl: 'build/pages/sources/sources.html',
  pipes: [TranslatePipe]
})
export class SourcesPage {
  public projectId: string;
  public sources: Array<any> = [];
  public project: any;
  public pendingNumber: number = 0;
  private currentTransition: any;
  @ViewChild(List) list: List;

  constructor(public nav: NavController, public params: NavParams, public translate: TranslateService, public storage: AppStorage) {
    this.projectId = params.get('id');
    this.loadProjectInfo();
    this.loadSources();
    this.loadPendingNumber();

    if (params.get('createNew') == true) {
      this.createSource();
    }else if (params.get('createNewWithScan') == true) {
      this.openModal('book', true);
    }
  }

  ionViewWillEnter() {
    this.loadSources();
    this.loadPendingNumber();
  }

  loadSources() {
    this.storage.getSourcesFromProjectId(this.projectId).then(sources => {
      this.sources = sources;
      this.sources.sort(function(a, b) {
        if (a.title && b.title) {
          return a.title.localeCompare(b.title);
        } else if (a.title) {
          return a.title.localeCompare(b.parsedSource);
        } else if (b.title) {
          return a.parsedSource.localeCompare(b.title);
        }
      });
    });
  }

  loadProjectInfo() {
    this.storage.getProjectFromId(this.projectId).then(project => {
      this.project = project;
    });
  }

  loadPendingNumber() {
    this.storage.getPendingNumber(this.projectId).then(num => {
      this.pendingNumber = num;
    });
  }

  createSource() {
    this.translate.get(["PROJECT.TYPES.BOOK", "PROJECT.TYPES.ARTICLE", "PROJECT.TYPES.INTERNET", "PROJECT.TYPES.CD", "PROJECT.TYPES.MOVIE", "PROJECT.TYPES.INTERVIEW", "PROJECT.DETAIL.CHOOSE_TYPE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe(translations => {
      let action = ActionSheet.create({
        title: translations['PROJECT.DETAIL.CHOOSE_TYPE'],
        buttons: [
          {
            text: translations['PROJECT.TYPES.BOOK'],
            handler: () => {
              this.currentTransition = action.dismiss();
              this.openModal('book');
              return false;
            }
          },
          {
            text: translations['PROJECT.TYPES.ARTICLE'],
            handler: () => {
              this.currentTransition = action.dismiss();
              this.openModal('article');
              return false;
            }
          },
          {
            text: translations['PROJECT.TYPES.INTERNET'],
            handler: () => {
              this.currentTransition = action.dismiss();
              this.openModal('internet');
              return false;
            }
          },
          {
            text: translations['PROJECT.TYPES.CD'],
            handler: () => {
              this.currentTransition = action.dismiss();
              this.openModal('cd');
              return false;
            }
          },
          {
            text: translations['PROJECT.TYPES.MOVIE'],
            handler: () => {
              this.currentTransition = action.dismiss();
              this.openModal('movie');
              return false;
            }
          },
          {
            text: translations['PROJECT.TYPES.INTERVIEW'],
            handler: () => {
              this.currentTransition = action.dismiss();
              this.openModal('interview');
              return false;
            }
          },
          {
            role: 'cancel',
            text: translations['PROJECT.DETAIL.POPUP.CANCEL']
          }
        ]
      });

      this.nav.present(action);
    });
  }

  openModal(type: string, openScan: boolean = false) {
    let modal = Modal.create(SourceModalPage, {
      type: type,
      project_id: this.projectId,
      scan: openScan
    });

    modal.onDismiss(() => {
      this.loadSources();
      this.loadPendingNumber();
    });

    if(this.currentTransition) {
      this.currentTransition.then(() => {
        this.currentTransition = null;
        this.nav.present(modal);
      });
    }else {
      this.nav.present(modal);
    }
  }

  deleteSource(source: any) {
    this.translate.get(["PROJECT.DETAIL.POPUP.DELETE_TITLE", "PROJECT.DETAIL.POPUP.DELETE_TEXT", "PROJECT.DETAIL.POPUP.DELETE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe(translations => {
      let alert = Alert.create({
        title: translations["PROJECT.DETAIL.POPUP.DELETE_TITLE"],
        message: translations["PROJECT.DETAIL.POPUP.DELETE_TEXT"],
        buttons: [
          {
            text: translations["PROJECT.DETAIL.POPUP.CANCEL"],
            handler: () => {
              this.list.closeSlidingItems();
            }
          },
          {
            text: translations["PROJECT.DETAIL.POPUP.DELETE"],
            handler: () => {
              this.storage.deleteSource(source._id);
              this.sources.splice(this.sources.indexOf(source), 1);
            }
          }
        ]
      });

      this.nav.present(alert);
    });
  }

  share() {
    this.translate.get("PROJECT.DETAIL.SHARE_TEXT", { project_title: this.project.name }).subscribe(text => {
      let textToShare = text;
      let errNum = 0;
      let arr_sources = JSON.parse(JSON.stringify(this.sources)).sort(function(a, b) {
        return a.parsedSource.localeCompare(b.parsedSource);
      });
      for (let i = 0; i < arr_sources.length; i++) {
        textToShare += arr_sources[i].parsedSource + "<br><br>";
        errNum += arr_sources[i].errors.length;
      }

      if (errNum > 0) {
        this.translate.get(["PROJECT.DETAIL.POPUP.ERRORS_SOURCES", "PROJECT.DETAIL.POPUP.SHARE_TEXT", "PROJECT.DETAIL.POPUP.SHARE", "PROJECT.DETAIL.POPUP.CANCEL"], { errNum:errNum }).subscribe((translations) => {
          let alert = Alert.create({
            title: translations["PROJECT.DETAIL.POPUP.SHARE_TEXT"],
            message: translations["PROJECT.DETAIL.POPUP.ERRORS_SOURCES"],
            buttons: [
              {
                text: translations["PROJECT.DETAIL.POPUP.CANCEL"]
              },
              {
                text: translations["PROJECT.DETAIL.POPUP.SHARE"],
                handler: () => {
                  SocialSharing.shareViaEmail(
                    textToShare,
                    this.project.name,
                    [],
                    [],
                    [],
                    []
                  );
                }
              }
            ]
          });

          this.nav.present(alert);
        });
      } else {
        SocialSharing.shareViaEmail(
          textToShare,
          this.project.name,
          [],
          [],
          [],
          []
        );
      }
    });
  }

  openSourcePage(source: any) {
    this.nav.push(SourcePage, {
      pId: this.projectId,
      id: source._id
    });
  }

  openPendingPage() {
    this.nav.push(PendingsPage, {
      pId: this.projectId
    });
  }
}
