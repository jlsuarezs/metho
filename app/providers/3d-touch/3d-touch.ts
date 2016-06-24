import { Injectable } from '@angular/core';
import { App, Alert } from 'ionic-angular';
import { ThreeDeeTouch } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { SourcesPage } from '../../pages/sources/sources';

import { AppStorage } from '../app-storage/app-storage';
import { Settings } from '../settings/settings';


@Injectable()
export class ThreeDeeTouchProvider {
  private whenStandard: any[] = [];
  private whenAdvanced: any[] = [];

  constructor(public settings: Settings, public app: App, public translate: TranslateService) {}

  init() {
    ThreeDeeTouch.isAvailable().then(avail => {
      this.configure();

      ThreeDeeTouch.onHomeIconPressed().subscribe(payload => {
        let navCtrl = this.app.getActiveNav();
        let projects = []; // Get from AppStorage
        navCtrl.popToRoot();
        console.log(navCtrl);
        if (projects.length == 0) {
          this.translate.get(["3D_TOUCH.NO_PROJECT_TITLE", "3D_TOUCH.NO_PROJECT_MESSAGE", "YES", "NO"]).subscribe(translations => {
            let alert = Alert.create({
              title: translations["3D_TOUCH.NO_PROJECT_TITLE"],
              message: translations["3D_TOUCH.NO_PROJECT_MESSAGE"],
              buttons: [
                {
                  text: translations["NO"]
                },
                {
                  text: translations["YES"],
                  handler: () => {
                    alert.dismiss().then(() => {
                      navCtrl.getActive();
                    });
                    return false;
                  }
                }
              ]
            });

            navCtrl.present(alert);
          });
        }else if (projects.length == 1) {
          if (payload.type == "newsource") {
            navCtrl.push(SourcesPage, {
              id: projects[0]._id,
              createNew: true
            });
          }else if (payload.type == "scan") {
            navCtrl.push(SourcesPage, {
              id: projects[0]._id,
              createNewWithScan: true
            });
          }
        }else {
          let alertBox = Alert.create({
            title: "",
            message: "",
            buttons: [
              {
                text: ""
              },
              {
                text: "",
                handler: data => {
                  if (payload.type == "newsource") {
                    // Get projects from AppStorage

                  }else if (payload.type == "scan") {

                  }else {
                    alert(payload.type);
                  }
                }
              }
            ]
          });

          for (var i = 0; i < projects.length; i++) {
            alertBox.addInput({
              type: "radio",
              label: projects[i].name,
              value: projects[i]._id,
              checked: false
            });
          }

          navCtrl.present(alertBox);
        }
      });
    }).catch(err => {
      console.log(err);
    });
  }

  configure() {
    this.translate.get(["3D_TOUCH.NEW_SOURCE", "3D_TOUCH.NEW_SOURCE_DESC", "3D_TOUCH.SCAN", "3D_TOUCH.SCAN_DESC"]).subscribe(translations => {
      this.whenStandard = [
        {
          type: 'newsource',
          title: translations["3D_TOUCH.NEW_SOURCE"],
          subtitle: translations["3D_TOUCH.NEW_SOURCE_DESC"],
          iconType: "Add"
        }
      ];

      this.whenAdvanced = [
        {
          type: 'newsource',
          title: translations["3D_TOUCH.NEW_SOURCE"],
          subtitle: translations["3D_TOUCH.NEW_SOURCE_DESC"],
          iconType: "Add"
        },
        {
          type: 'scan',
          title: translations["3D_TOUCH.SCAN"],
          subtitle: translations["3D_TOUCH.SCAN_DESC"],
          iconType: "CapturePhoto"
        }
      ];
      if (this.settings.get('advanced')) {
        ThreeDeeTouch.configureQuickActions(this.whenAdvanced);
      }else {
        ThreeDeeTouch.configureQuickActions(this.whenStandard);
      }
    });
  }

  update() {
    ThreeDeeTouch.isAvailable().then(avail => {
      this.configure();
    }).catch(err => {
      console.log(err);
    });
  }
}
