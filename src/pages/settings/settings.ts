import { ViewChild, Component } from "@angular/core";

import { NavController, AlertController, List } from "ionic-angular";
import { TranslateService } from "ng2-translate/ng2-translate";

import { AdvancedModePage } from "../advanced-mode/advanced-mode";
import { AttributionsPage } from "../attributions/attributions";
import { FeedbackPage } from "../feedback/feedback";

import { AdvancedMode } from "../../providers/advanced-mode";
import { Language } from "../../providers/language";
import { Settings } from "../../providers/settings";

import deepcopy from "deepcopy";

@Component({
  selector: "settings",
  templateUrl: "settings.html"
})
export class SettingsPage {
  public settings: SettingsList = {};
  public enableAdvanced: boolean = false;
  public advancedAvailable: boolean = true;
  public advancedPage: any;
  public attributionsPage: any;
  public feedbackPage: any;
  @ViewChild(List) list: List;

  public showIlluminatiEaster: boolean = false;

  constructor(
    public nav: NavController,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public advanced: AdvancedMode,
    public language: Language,
    public settingService: Settings,
  ) {
    this.advancedPage = AdvancedModePage;
    this.attributionsPage = AttributionsPage;
    this.feedbackPage = FeedbackPage;
    if (this.advanced.hasLoaded) {
      this.enableAdvanced = true;
    }else {
      this.advanced.loadEvents.subscribe(() => {
        this.enableAdvanced = true;
      });
    }
    this.advancedAvailable = this.advanced.isAvailable();
  }

  loadSettings() {
    this.settings = deepcopy(this.settingService.getAll());
  }

  ionViewWillEnter() {
    this.loadSettings();
  }

  toggleAdvanced() {
    if (this.settings.advanced != this.settingService.getAll().advanced) {
      if (this.settings.advanced) {
        this.advanced.enable().then(() => {

        }).catch(err => {
          this.settings.advanced = false;
        });
      }else {
        this.advanced.disable();
      }
    }
  }

  toggleIgnoreErrors() {
    if (this.settings.ignoreErrors != this.settingService.getAll().ignoreErrors) {
      this.settingService.set("ignoreErrors", this.settings.ignoreErrors);
    }
  }

  editName() {
    this.translate.get(["SETTINGS.EDIT_NAME", "COMMON.CANCEL", "COMMON.EDIT"]).subscribe(translations => {
      let alert = this.alertCtrl.create({
        title: translations["SETTINGS.EDIT_NAME"],
        inputs: [
          {
            type: "text",
            name: "firstname",
            value: this.settings.firstname
          },
          {
            type: "text",
            name: "lastname",
            value: this.settings.lastname
          }
        ],
        buttons: [
          {
            text: translations["COMMON.CANCEL"],
            handler: () => {
              this.list.closeSlidingItems();
            }
          },
          {
            text: translations["COMMON.EDIT"],
            handler: results => {
              this.settingService.set("firstname", results.firstname);
              this.settingService.set("lastname", results.lastname);
              this.loadSettings();
              this.list.closeSlidingItems();
            }
          }
        ]
      });

      alert.present();
    });
  }

  forgetName() {
    this.settingService.set("firstname", "");
    this.settingService.set("lastname", "");
    this.loadSettings();
  }

  changeLanguage() {
    if (this.settings.overideLang != this.settingService.getAll().overideLang) {
      this.language.change(this.settings.overideLang);
    }
  }

  illuminatiEasterEgg() {
    this.showIlluminatiEaster = true;
    setTimeout(() => this.showIlluminatiEaster = false, 5250);
  }

  explainUnavailable() {
    if (!this.enableAdvanced) {
      this.translate.get(["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK", "COMMON.OK"]).subscribe(translations => {
        let alert = this.alertCtrl.create({
          title: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE"],
          message: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"],
          buttons: [
            {
              text: translations["COMMON.OK"]
            }
          ]
        });

        alert.present();
      });
    }else if (!this.advancedAvailable) {
      this.translate.get(["SETTINGS.ADVANCED_MODE.POPUP.UNSUPPORTED_DEVICE_TITLE", "SETTINGS.ADVANCED_MODE.POPUP.UNSUPPORTED_DEVICE", "COMMON.OK"]).subscribe(translations => {
        let alert = this.alertCtrl.create({
          title: translations["SETTINGS.ADVANCED_MODE.POPUP.UNSUPPORTED_DEVICE_TITLE"],
          message: translations["SETTINGS.ADVANCED_MODE.POPUP.UNSUPPORTED_DEVICE"],
          buttons: [
            {
              text: translations["COMMON.OK"]
            }
          ]
        });

        alert.present();
      });
    }
  }
}
