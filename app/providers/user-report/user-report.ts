import {Injectable} from '@angular/core';
import {AlertController, App, NavController} from 'ionic-angular';
import {SocialSharing, Device} from 'ionic-native';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Injectable()
export class UserReport {
  public nav: NavController;

  constructor(public translate: TranslateService, public alertCtrl: AlertController) {}

  report(err: any) {
    console.log(err);
    let errStr: string = err;
    let stacktrace: string = "";
    if (typeof err != 'string') {
      errStr = err.toString();
    }

    if (typeof err == 'object') {
      try {
        stacktrace = err.stack;
      } catch (e) {
        console.log(e);
        stacktrace = "";
      }
    }
    this.translate.get(["YES", "NO", "REPORT.UNKNOWN", "REPORT.REPORT_?", "REPORT.DESC","REPORT.DO_NOT_EDIT", "REPORT.ERROR"]).subscribe(translations => {
      let alert = this.alertCtrl.create({
        title: translations["REPORT.UNKNOWN"],
        message: translations["REPORT.REPORT_?"],
        buttons: [
          {
            text: translations["NO"]
          },
          {
            text: translations["YES"],
            handler: () => {
              SocialSharing.shareViaEmail(
                `<b>${translations['REPORT.DESC']}</b><br><br><br>
                <b>${translations['REPORT.DO_NOT_EDIT']}</b><br>
                ${Device.device.platform} ${Device.device.version}<br>
                ${Device.device.manufacturer} ${Device.device.model}<br>
                ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
                Cordova ${Device.device.cordova}</p><br>
                ${errStr}<br>
                ${stacktrace}`,
                translations['REPORT.ERROR'],
                ['methoappeei@gmail.com'],
                [],
                [],
                []
              );
            }
          }
        ]
      });

      alert.present();
    });
  }
}
