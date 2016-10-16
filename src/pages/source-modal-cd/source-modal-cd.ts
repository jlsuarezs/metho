import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams, AlertController, ActionSheetController } from "ionic-angular";
import { Keyboard } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { AppStorage } from "../../providers/app-storage";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";


@Component({
  selector: "source-modal-cd",
  templateUrl: "source-modal-cd.html"
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
    if(this.params.get("editing") == true) {
      this.isNew = false;
    }else {
      this.isNew = true;
    }

    if (typeof this.params.get("data") !== "undefined") {
      this.noData = false;
      this.previous = this.params.get("data");
    }else {
      this.noData = true;
    }

    this.projectId = this.params.get("projectId");

    if (typeof this.params.get("pendingId") !== "undefined") {
      this.pendingId = this.params.get("pendingId");
    }

    this.form = fb.group({
      hasAuthors: [this.noData ? false : this.previous.hasAuthors],
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      author2firstname: [this.noData ? "" : this.previous.author2firstname],
      author2lastname: [this.noData ? "" : this.previous.author2lastname],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      publicationLocation: [this.noData ? "" : this.previous.publicationLocation],
      publicationDate: [this.noData ? "" : this.previous.publicationDate]
    });
  }

  ionViewDidEnter() {
    if (!this.settings.get("cdAlertShown")) {
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
        this.settings.set("cdAlertShown", true);
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
              role: "destructive",
              handler: () => {
                actionsheet.dismiss().then(() => {
                  this.viewCtrl.dismiss();
                });
                return false;
              }
            },
            {
              text: translations["COMMON.CANCEL"],
              role: "cancel"
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
    values.type = "cd";
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

    Keyboard.close();
    this.viewCtrl.dismiss();
  }

  isEmpty() {
    if (!this.form.value.author1firstname && !this.form.value.author1lastname && !this.form.value.author2firstname && !this.form.value.author2lastname && !this.form.value.editor && !this.form.value.title && !this.form.value.hasAuthors && !this.form.value.publicationDate && !this.form.value.publicationLocation) {
      return true;
    }else {
      return false;
    }
  }
}
