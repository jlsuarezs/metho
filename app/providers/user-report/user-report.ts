import {Injectable} from '@angular/core';
import {Alert, App, NavController} from 'ionic-angular';
import {EmailComposer, Device} from 'ionic-native';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Injectable()
export class UserReport {
  public nav: NavController;

  constructor(public translate: TranslateService, public app: App) {
    this.nav = this.app.getActiveNav();
  }

  report(err: any) {
    if (typeof err != 'string') {
      err = JSON.parse(err);
    }
    this.translate.get(["YES", "NO", "REPORT.ERROR", "REPORT.UNKNOWN", "REPORT.REPORT_?","REPORT.DO_NOT_EDIT", "REPORT.TITLE"]).subscribe(translations => {
      let alert = Alert.create({
        title: translations["REPORT.UNKNOWN"],
        message: translations["REPORT.REPORT_?"],
        buttons: [
          {
            text: translations["NO"]
          },
          {
            text: translations["YES"],
            handler: () => {
              EmailComposer.isAvailable().then(isAvail => {
                if (isAvail) {
                  EmailComposer.open({
                    to: 'methoappeei@gmail.com',
                    subject: translations['REPORT.TITLE'],
                    body: translations['REPORT.DO_NOT_EDIT'] + Device.device.platform + " " + Device.device.version + "<br>" + Device.device.model + "<br>" + (window.screen.width * window.devicePixelRatio) + "x" + (window.screen.height * window.devicePixelRatio) + "<br>Cordova " + Device.device.cordova + "</p><br>" + err,
                    isHtml: true
                  });
                }
              });
            }
          }
        ]
      });

      this.nav.present(alert);
    });
  }
}
