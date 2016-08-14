import {NavController, NavParams, ActionSheetController, ModalController, AlertController, List, Content} from 'ionic-angular';
import {ViewChild, Component} from '@angular/core';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {SocialSharing} from 'ionic-native';

import {SourcePage} from '../source/source';

// Modals
import {SourceModalBookPage} from '../source-modal-book/source-modal-book';
import {SourceModalArticlePage} from '../source-modal-article/source-modal-article';
import {SourceModalInternetPage} from '../source-modal-internet/source-modal-internet';
import {SourceModalCdPage} from '../source-modal-cd/source-modal-cd';
import {SourceModalMoviePage} from '../source-modal-movie/source-modal-movie';
import {SourceModalInterviewPage} from '../source-modal-interview/source-modal-interview';

import {PendingsPage} from '../pendings/pendings';
import {AppStorage} from '../../providers/app-storage/app-storage';
import {Settings} from '../../providers/settings/settings';

@Component({
  templateUrl: 'build/pages/sources/sources.html',
  pipes: [TranslatePipe]
})
export class SourcesPage {
  public projectId: string;
  public sources: Array<any> = [];
  public project: any = {};
  public pendingNumber: number = 0;
  private currentTransition: any;
  public searchQuery: string = "";
  public filteredSources: Array<any> = [];
  @ViewChild(List) list: List;
  @ViewChild(Content) content: Content;

  constructor(public nav: NavController, public alertCtrl: AlertController, public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController, public params: NavParams, public translate: TranslateService, public storage: AppStorage, public settings: Settings) {
    this.projectId = params.get('id');
    this.loadProjectInfo();
  }

  ionViewWillEnter() {
    this.loadSources();
    this.loadPendingNumber();
  }

  ionViewDidEnter() {
    if (this.sources.length == 0) {
      this.content.scrollToBottom(250);
    }
  }

  loadSources() {
    this.storage.getSourcesFromProjectId(this.projectId).then(sources => {
      this.sources = sources;
      this.filteredSources = sources;
      this.sources.sort(function(a, b) {
        if (a.title && b.title) {
          return a.title.localeCompare(b.title);
        } else if (a.title) {
          return a.title.localeCompare(b.parsedSource);
        } else if (b.title) {
          return a.parsedSource.localeCompare(b.title);
        }
      });
      this.updateSearch();
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

    this.storage.loadPendingsFromProjectId(this.projectId);
  }

  createSource() {
    this.translate.get(["PROJECT.TYPES.BOOK", "PROJECT.TYPES.ARTICLE", "PROJECT.TYPES.INTERNET", "PROJECT.TYPES.CD", "PROJECT.TYPES.MOVIE", "PROJECT.TYPES.INTERVIEW", "PROJECT.DETAIL.CHOOSE_TYPE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe(translations => {
      let action = this.actionSheetCtrl.create({
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

      action.present();
    });
  }

  openModal(type: string, openScan: boolean = false) {
    switch (type) {
      case 'book':
        var modal = this.modalCtrl.create(SourceModalBookPage, {
          projectId: this.projectId,
          scan: openScan
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'article':
        var modal = this.modalCtrl.create(SourceModalArticlePage, {
          projectId: this.projectId
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'internet':
        var modal = this.modalCtrl.create(SourceModalInternetPage, {
          projectId: this.projectId
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'cd':
        var modal = this.modalCtrl.create(SourceModalCdPage, {
          projectId: this.projectId
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'movie':
        var modal = this.modalCtrl.create(SourceModalMoviePage, {
          projectId: this.projectId
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'interview':
        var modal = this.modalCtrl.create(SourceModalInterviewPage, {
          projectId: this.projectId
        }, {
          enableBackdropDismiss: false
        });
        break;
    }

    modal.onWillDismiss(() => {
      this.loadSources();
      this.loadPendingNumber();
    });

    if(this.currentTransition) {
      this.currentTransition.then(() => {
        this.currentTransition = null;
        modal.present();
      });
    }else {
      modal.present();
    }
  }

  deleteSource(source: any) {
    this.translate.get(["PROJECT.DETAIL.POPUP.DELETE_TITLE", "PROJECT.DETAIL.POPUP.DELETE_TEXT", "PROJECT.DETAIL.POPUP.DELETE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe(translations => {
      let alert = this.alertCtrl.create({
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

      alert.present();
    });
  }

  share() {
    this.translate.get("PROJECT.DETAIL.SHARE_TEXT", { project_title: this.project.name }).subscribe(text => {
      let textToShare = text;
      let errNum = 0;
      let arr_sources = JSON.parse(JSON.stringify(this.sources)).sort((a, b) => {
        return a.parsedSource.localeCompare(b.parsedSource);
      });
      arr_sources.forEach(value => {
        textToShare += value.parsedSource + "<br><br>";
        errNum += value.errors.length;
      });

      if (errNum > 0 && !this.settings.get('ignoreErrors')) {
        this.translate.get(["PROJECT.DETAIL.POPUP.ERRORS_SOURCES", "PROJECT.DETAIL.POPUP.SHARE_TEXT", "PROJECT.DETAIL.POPUP.SHARE", "PROJECT.DETAIL.POPUP.CANCEL"], { errNum:errNum }).subscribe((translations) => {
          let alert = this.alertCtrl.create({
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

          alert.present();
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

  updateSearch() {
    this.filteredSources = this.sources;

    let q = this.searchQuery;

    if (q.trim() == '') {
      return;
    }

    let qa = q.trim().split(' ');

    this.filteredSources = this.filteredSources.filter((v) => {
      if (qa.length > 1) {
        for (var i = 0; i < qa.length; i++) {
          if (v.parsedSource.toLowerCase().indexOf(qa[i].toLowerCase()) > -1 || v.parsedType.toLowerCase().indexOf(qa[i].toLowerCase()) > -1) {
          }else {
            return false;
          }
        }
        return true;
      }else {
        if (v.parsedSource.toLowerCase().indexOf(qa[0].toLowerCase()) > -1 || v.parsedType.toLowerCase().indexOf(qa[0].toLowerCase()) > -1) {
          return true;
        }
      }
      return false;
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
