import {NavController, NavParams, ModalController, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslateService} from 'ng2-translate/ng2-translate';

import {AppStorage} from '../../providers/app-storage/app-storage';
import {Parse} from '../../providers/parse/parse';

// Modals
import {SourceModalBookPage} from '../source-modal-book/source-modal-book';
import {SourceModalArticlePage} from '../source-modal-article/source-modal-article';
import {SourceModalInternetPage} from '../source-modal-internet/source-modal-internet';
import {SourceModalCdPage} from '../source-modal-cd/source-modal-cd';
import {SourceModalMoviePage} from '../source-modal-movie/source-modal-movie';
import {SourceModalInterviewPage} from '../source-modal-interview/source-modal-interview';

@Component({
  templateUrl: 'build/pages/source/source.html'
})
export class SourcePage {
  public source: Source = {
    warnings: [],
    errors: [],
    type: "",
    title: ""
  };
  public id: string;

  constructor(public nav: NavController, public alertCtrl: AlertController, public modalCtrl: ModalController, public params: NavParams, public storage: AppStorage, public parse: Parse, public translate: TranslateService) {
    this.id = this.params.get('id');
  }

  ionViewWillEnter() {
    this.loadSource();
  }

  loadSource() {
    this.storage.getSourceFromId(this.id).then(source => {
      this.source = source;
    });
  }

  solve(error: SourceError) {
    this.translate.get(["PROJECT.SOURCE.CONFIRM", "PROJECT.SOURCE.CANCEL"]).subscribe(translations => {
      let alert = this.alertCtrl.create({
        title: error.promptTitle,
        message: error.promptText,
        buttons: [
          {
            text: translations["PROJECT.SOURCE.CANCEL"]
          },
          {
            text: translations["PROJECT.SOURCE.CONFIRM"],
            handler: data => {
              if (error.complex) {
                if (error.type == 'select') {
                  this.source[error.var] = data;
                }
              }else {
                this.source[error.var] = data.input;
              }
              this.source = this.parse.parse(this.source);
              this.storage.setSourceFromId(this.id, this.source);
            }
          }
        ]
      });

      if (error.complex) {
        if (error.type == 'select') {
          error.options.forEach(option => {
            alert.addInput({
              type: 'radio',
              label: option.text,
              value: option.value,
              checked: false
            });
          });
        }
      }else {
        alert.addInput({
          name: 'input'
        });
      }

      alert.present();
    });
  }

  edit() {
    switch (this.source.type) {
      case 'book':
        var modal = this.modalCtrl.create(SourceModalBookPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'article':
        var modal = this.modalCtrl.create(SourceModalArticlePage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'internet':
        var modal = this.modalCtrl.create(SourceModalInternetPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'cd':
        var modal = this.modalCtrl.create(SourceModalCdPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'movie':
        var modal = this.modalCtrl.create(SourceModalMoviePage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'interview':
        var modal = this.modalCtrl.create(SourceModalInterviewPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
    }

    modal.onWillDismiss(() => {
      this.loadSource();
    });

    modal.present();
  }
}
