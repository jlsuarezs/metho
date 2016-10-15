import { Injectable } from "@angular/core";

import { AlertController } from "ionic-angular";
import { SocialSharing, Device, AppVersion, Splashscreen } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

@Injectable()
export class Report {
  constructor(
    public translate: TranslateService,
    public alertCtrl: AlertController,
  ) {}

  report(err: any) {
    console.log(err);
    let errStr: string = err;
    let stacktrace: string = "";
    if (typeof err != "string") {
      errStr = err.toString();
    }

    if (typeof err == "object") {
      try {
        stacktrace = err.stack;
      } catch (e) {
        console.log(e);
        stacktrace = "";
      }
    }
    this.translate.get(["COMMON.YES", "COMMON.NO", "REPORT.UNKNOWN", "REPORT.REPORT_?", "REPORT.DESC","REPORT.DO_NOT_EDIT", "REPORT.ERROR"]).subscribe(translations => {
      this.diagnostics().then(diags => {
        let alert = this.alertCtrl.create({
          title: translations["REPORT.UNKNOWN"],
          message: translations["REPORT.REPORT_?"],
          buttons: [
            {
              text: translations["COMMON.NO"],
              handler: () => {
                this.askForRefresh(alert.dismiss());
                return false;
              }
            },
            {
              text: translations["COMMON.YES"],
              handler: () => {
                SocialSharing.shareViaEmail(
                  `<b>${translations["REPORT.DESC"]}</b><br><br><br>
                  <b>${translations["REPORT.DO_NOT_EDIT"]}</b><br>
                  ${diags}</p><br>
                  ${errStr}<br>
                  ${stacktrace}`,
                  translations["REPORT.ERROR"],
                  ["methoappeei@gmail.com"],
                  [],
                  [],
                  []
                ).then(() => {
                  this.askForRefresh();
                });
              }
            }
          ]
        });

        alert.present();
      });
    });
  }

  askForRefresh(transition:Promise<any> = Promise.resolve()) {
    transition.then(() => {
      this.translate.get(["COMMON.YES", "COMMON.NO", "REPORT.ERROR", "REPORT.RELOAD?"]).subscribe(translations => {
        let alert = this.alertCtrl.create({
          title: translations["REPORT.ERROR"],
          message: translations["REPORT.RELOAD?"],
          buttons: [
            {
              text: translations["COMMON.NO"]
            },
            {
              text: translations["COMMON.YES"],
              handler: () => {
                Splashscreen.show();
                document.location.reload();
              }
            }
          ]
        });

        alert.present();
      });
    });
  }

  diagnostics(): Promise<string> {
    return new Promise(resolve => {
      Promise.all([AppVersion.getVersionNumber(), AppVersion.getVersionCode()]).then(result => {
        resolve(`${Device.device.platform} ${Device.device.version}<br>
          ${Device.device.manufacturer} ${Device.device.model}<br>
          ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
          Cordova ${Device.device.cordova}<br>
          Metho v${result[0]}(${result[1]})`);
      }).catch(err => {
        resolve(`${Device.device.platform} ${Device.device.version}<br>
          ${Device.device.manufacturer} ${Device.device.model}<br>
          ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
          Cordova ${Device.device.cordova}`);
      });
    });
  }
}
