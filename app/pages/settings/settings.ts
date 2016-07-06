import {NavController, AlertController, List} from 'ionic-angular';
import {ViewChild, Component} from '@angular/core';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';

import {AdvancedModePage} from '../advanced-mode/advanced-mode';
import {AttributionsPage} from '../attributions/attributions';
import {FeedbackPage} from '../feedback/feedback';

import {Settings} from '../../providers/settings/settings';
import {Language} from '../../providers/language/language';
import {AdvancedMode} from '../../providers/advanced-mode/advanced-mode';

@Component({
  templateUrl: 'build/pages/settings/settings.html',
  pipes: [TranslatePipe]
})
export class SettingsPage {
  public settings: any = {};
  public advancedPage: any;
  public attributionsPage: any;
  public feedbackPage: any;
  @ViewChild(List) list: List;

  constructor(public nav: NavController, public alertCtrl: AlertController, public translate: TranslateService,  public settingService: Settings, public advanced: AdvancedMode, public language: Language) {
    this.advancedPage = AdvancedModePage;
    this.attributionsPage = AttributionsPage;
    this.feedbackPage = FeedbackPage;
    this.loadSettings();
  }

  loadSettings() {
    this.settings = this.settingService.getAll();
  }

  ionViewWillEnter() {
    this.loadSettings();
  }

  toggleAdvanced() {
    if (this.settings.advanced == true) {
      this.advanced.enable().then(() => {

      }).catch(err => {
        this.settings.advanced = false;
      });
    }else {
      this.advanced.disable();
    }
  }

  toggleIgnoreErrors() {
    this.settingService.set('ignoreErrors', this.settings.ignoreErrors);
  }

  changeOrder() {
    this.settingService.set('defaultOrder', this.settings.defaultOrder);
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
    this.language.change(this.settings.overideLang);
  }
}
