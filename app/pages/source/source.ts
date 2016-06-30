import {NavController, NavParams, Modal, Alert} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';

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
  templateUrl: 'build/pages/source/source.html',
  pipes: [TranslatePipe]
})
export class SourcePage {
  public source: any = {
    warnings: [],
    errors: [],
    type: ""
  };
  public id: string;

  constructor(public nav: NavController, public params: NavParams, public storage: AppStorage, public parse: Parse, public translate: TranslateService) {
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

  solveError(error: any) {
    this.translate.get(["PROJECT.SOURCE.CONFIRM", "PROJECT.SOURCE.CANCEL"]).subscribe(translations => {
      let alert = Alert.create({
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
          for (var i = 0; i < error.options.length; i++) {
            alert.addInput({
              type: 'radio',
              label: error.options[i].text,
              value: error.options[i].value,
              checked: false
            });
          }
        }
      }else {
        alert.addInput({
          name: 'input'
        });
      }

      this.nav.present(alert);
    });
  }

  solveWarning(warning: any) {
    this.translate.get(["PROJECT.SOURCE.CONFIRM", "PROJECT.SOURCE.CANCEL"]).subscribe(translations => {
      let alert = Alert.create({
        title: warning.promptTitle,
        message: warning.promptText,
        buttons: [
          {
            text: translations["PROJECT.SOURCE.CANCEL"]
          },
          {
            text: translations["PROJECT.SOURCE.CONFIRM"],
            handler: data => {
              this.source[warning.var] = data.input;
              this.source = this.parse.parse(this.source);
              this.storage.setSourceFromId(this.id, this.source);
            }
          }
        ]
      });


      alert.addInput({
        name: 'input'
      });

      this.nav.present(alert);
    });
  }

  edit() {
    switch (this.source.type) {
      case 'book':
        var modal = Modal.create(SourceModalBookPage, {
          type: this.source.type,
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        });
        break;
      case 'article':
        var modal = Modal.create(SourceModalArticlePage, {
          type: this.source.type,
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        });
        break;
      case 'internet':
        var modal = Modal.create(SourceModalInternetPage, {
          type: this.source.type,
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        });
        break;
      case 'cd':
        var modal = Modal.create(SourceModalCdPage, {
          type: this.source.type,
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        });
        break;
      case 'movie':
        var modal = Modal.create(SourceModalMoviePage, {
          type: this.source.type,
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        });
        break;
      case 'interview':
        var modal = Modal.create(SourceModalInterviewPage, {
          type: this.source.type,
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        });
        break;
    }

    modal.onDismiss(() => {
      this.loadSource();
    });

    this.nav.present(modal);
  }
}
