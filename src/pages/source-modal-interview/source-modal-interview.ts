import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams, NavController, AlertController, ActionSheetController } from "ionic-angular";
import { Keyboard } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";


@Component({
  selector: "source-modal-interview",
  templateUrl: "source-modal-interview.html"
})
export class SourceModalInterviewPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public firstname: string;
  public lastname: string;
  public hasConfirmed: boolean = false;

  public form: FormGroup;
  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;
  public civilityOpts: any = {};

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public translate: TranslateService,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public storage: AppStorage,
    public language: Language,
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

    this.firstname = this.params.get("firstname");

    this.lastname = this.params.get("lastname");

    if (typeof this.params.get("pendingId") !== "undefined") {
      this.pendingId = this.params.get("pendingId");
    }

    let moment = this.language.getMoment();
    this.form = fb.group({
      author1firstname: [this.noData ? this.settings.get("firstname") : this.previous.author1firstname],
      author1lastname: [this.noData ? this.settings.get("lastname") : this.previous.author1lastname],
      civility: [this.noData ? "" : this.previous.civility],
      interviewed1firstname: [this.noData ? "" : this.previous.interviewed1firstname],
      interviewed1lastname: [this.noData ? "" : this.previous.interviewed1lastname],
      interviewedTitle: [this.noData ? "" : this.previous.interviewedTitle],
      publicationLocation: [this.noData ? "" : this.previous.publicationLocation],
      consultationDate: [this.noData ? moment().utcOffset(0).subtract(-moment().utcOffset(), "minutes").toISOString() : this.previous.consultationDate],
    });
    this.generateLabels();
    // Use async once issue is resolved
    this.civilityOpts = {
      title: this.translate.instant("PROJECT.PARSE.CIVILITY_TITLE.TITLE")
    };
  }

  generateLabels() {
    this.monthList = this.language.getMoment().months().join(",");
    this.monthShortList = this.language.getMoment().monthsShort().join(",");
    this.weekdayList = this.language.getMoment().weekdays().join(",");
    this.weekdayShortList = this.language.getMoment().weekdaysShort().join(",");
  }

  dismiss() {
    if (!this.isEmpty() && this.isNew) {
      this.translate.get([
        "COMMON.CANCEL",
        "PROJECT.DETAIL.MODAL.DELETE_DRAFT"
      ]).subscribe(translations => {
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
    values.type = "interview";
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

    if (values.author1firstname && values.author1lastname && !this.settings.get("firstname") && !this.settings.get("lastname")) {
      this.translate.get([
        "PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME",
        "PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME",
        "COMMON.YES",
        "COMMON.NO"
      ]).subscribe(translations => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME"],
          message: translations["PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME"],
          buttons: [
            {
              text: translations["COMMON.NO"],
              handler: () => {
                Keyboard.close();
                this.viewCtrl.dismiss();
              }
            },
            {
              text: translations["COMMON.YES"],
              handler: () => {
                let transition = alert.dismiss();
                this.settings.set("firstname", values.author1firstname);
                this.settings.set("lastname", values.author1lastname);

                transition.then(() => {
                  Keyboard.close();
                  this.viewCtrl.dismiss();
                });
                return false;
              }
            }
          ]
        });
        alert.present();
      });
    }else {
      Keyboard.close();
      this.viewCtrl.dismiss();
    }
  }

  isEmpty() {
    if (!this.form.value.author1firstname && !this.form.value.author1lastname && !this.form.value.interviewed1firstname && !this.form.value.interviewed1lastname && !this.form.value.interviewedTitle && !this.form.value.publicationLocation && !this.form.value.civility && !this.form.value.publicationLocation) {
      return true;
    }else {
      return false;
    }
  }
}
