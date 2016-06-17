import {Page, NavController, NavParams, Modal, Alert} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';

import {AppStorage} from '../../providers/app-storage/app-storage';
import {Parse} from '../../providers/parse/parse';
import {SourceModalPage} from '../source-modal/source-modal';

@Page({
  templateUrl: 'build/pages/source/source.html',
  pipes: [TranslatePipe]
})
export class SourcePage {
  public source: any = {
    warnings: [],
    errors: []
  };
  public id: string;

  constructor(public nav: NavController, public params: NavParams, public storage: AppStorage, public parse: Parse, public translate: TranslateService) {
    this.id = this.params.get('id');
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
    let modal = Modal.create(SourceModalPage, {
      type: this.source.type,
      data: this.source,
      editing: true,
      project_id: this.source.project_id
    });

    modal.onDismiss(() => {
      this.storage.getSourceFromId(this.id).then(source => {
        this.source = source;
      })
    });

    this.nav.present(modal);
  }
}
