import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { ViewController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { AppStorage } from '../../providers/app-storage/app-storage';
import { Parse } from '../../providers/parse/parse';
import { Settings } from '../../providers/settings/settings';


@Component({
  templateUrl: 'build/pages/source-modal-cd/source-modal-cd.html'
})
export class SourceModalCdPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public hasConfirmed: boolean = false;

  public form: FormGroup;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public translate: TranslateService,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public storage: AppStorage,
    public parse: Parse,
    public settings: Settings,
    public fb: FormBuilder,
  ) {
    if(this.params.get('editing') == true) {
      this.isNew = false;
    }else {
      this.isNew = true;
    }

    if (typeof this.params.get('data') !== "undefined") {
      this.noData = false;
      this.previous = this.params.get('data');
    }else {
      this.noData = true;
    }

    this.projectId = this.params.get('projectId');

    if (typeof this.params.get('pendingId') !== "undefined") {
      this.pendingId = this.params.get('pendingId');
    }

    this.form = fb.group({
      hasAuthors: [this.noData ? false : this.previous.hasAuthors],
      author1firstname: [this.noData ? '' : this.previous.author1firstname],
      author1lastname: [this.noData ? '' : this.previous.author1lastname],
      author2firstname: [this.noData ? '' : this.previous.author2firstname],
      author2lastname: [this.noData ? '' : this.previous.author2lastname],
      title: [this.noData ? '' : this.previous.title],
      editor: [this.noData ? '' : this.previous.editor],
      publicationLocation: [this.noData ? '' : this.previous.publicationLocation],
      publicationDate: [this.noData ? '' : this.previous.publicationDate]
    });
  }

  ionViewDidEnter() {
    if (!this.settings.get('cdAlertShown')) {
      this.translate.get(["COMMON.OK", "PROJECT.DETAIL.POPUP.USE_CD_FOR_INFORMATION", "PROJECT.DETAIL.POPUP.CAUTION"]).subscribe(translations => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.CAUTION"],
          message: translations["PROJECT.DETAIL.POPUP.USE_CD_FOR_INFORMATION"],
          buttons: [
            {
              text: translations["COMMON.OK"]
            }
          ]
        });

        alert.present();
        this.settings.set('cdAlertShown', true);
      });
    }
  }

  dismiss() {
    if (!this.isEmpty() && this.isNew) {
      this.translate.get(["COMMON.CANCEL", "PROJECT.DETAIL.MODAL.DELETE_DRAFT"]).subscribe(translations => {
        let actionsheet = this.actionSheetCtrl.create({
          buttons: [
            {
              text: translations["PROJECT.DETAIL.MODAL.DELETE_DRAFT"],
              role: 'destructive',
              handler: () => {
                actionsheet.dismiss().then(() => {
                  this.viewCtrl.dismiss();
                });
                return false;
              }
            },
            {
              text: translations["COMMON.CANCEL"],
              role: 'cancel'
            }
          ]
        });

        actionsheet.present();
      });
    }else {
      this.viewCtrl.dismiss();
    }
  }

  submitIfEnter(event) {
    if (event.keyCode == 13 && !this.hasConfirmed) {
      this.confirm();
      this.hasConfirmed = true;
    }
  }

  confirm() {
    var values = this.form.value;
    values.type = 'cd';
    let parsed = this.parse.parse(values);
    parsed.project_id = this.projectId;
    if (this.isNew) {
      this.storage.createSource(parsed);
      if (this.pendingId) {
        this.storage.deletePending(this.pendingId);
      }
    }else {
      this.storage.setSourceFromId(this.previous._id, parsed);
    }

    this.viewCtrl.dismiss();
  }

  isEmpty() {
    if (!this.form.find('author1firstname').value && !this.form.find('author1lastname').value && !this.form.find('author2firstname').value && !this.form.find('author2lastname').value && !this.form.find('editor').value && !this.form.find('title').value && !this.form.find('hasAuthors').value && !this.form.find('publicationDate').value && !this.form.find('publicationLocation').value) {
      return true;
    }else {
      return false;
    }
  }
}
