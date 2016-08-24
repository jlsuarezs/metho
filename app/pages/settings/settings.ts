import {NavController, AlertController, List} from 'ionic-angular';
import {ViewChild, Component} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';

import {AdvancedModePage} from '../advanced-mode/advanced-mode';
import {AttributionsPage} from '../attributions/attributions';
import {FeedbackPage} from '../feedback/feedback';

import {Settings} from '../../providers/settings/settings';
import {Language} from '../../providers/language/language';
import {AdvancedMode} from '../../providers/advanced-mode/advanced-mode';

declare const require: any;

const deepcopy = require('deepcopy');

@Component({
  templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
  public settings: SettingsList = {};
  public enableAdvanced: boolean = false;
  public advancedPage: any;
  public attributionsPage: any;
  public feedbackPage: any;
  @ViewChild(List) list: List;

  constructor(public nav: NavController, public alertCtrl: AlertController, public translate: TranslateService,  public settingService: Settings, public advanced: AdvancedMode, public language: Language) {
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
      this.settingService.set('ignoreErrors', this.settings.ignoreErrors);
    }
  }

  editName() {
    this.translate.get(["SETTINGS.EDIT_NAME", "SETTINGS.CANCEL", "SETTINGS.EDIT"]).subscribe(translations => {
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
            text: translations["SETTINGS.CANCEL"],
            handler: () => {
              this.list.closeSlidingItems();
            }
          },
          {
            text: translations["SETTINGS.EDIT"],
            handler: results => {
              this.settingService.set('firstname', results.firstname);
              this.settingService.set('lastname', results.lastname);
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
    this.settingService.set('firstname', '');
    this.settingService.set('lastname', '');
    this.loadSettings();
  }

  changeLanguage() {
    if (this.settings.overideLang != this.settingService.getAll().overideLang) {
      this.language.change(this.settings.overideLang);
    }
  }
}
