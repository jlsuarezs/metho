import {Page, NavController} from 'ionic-angular';

import {SocialSharing, Device} from 'ionic-native';

import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/feedback/feedback.html',
  pipes: [TranslatePipe]
})
export class FeedbackPage {
  constructor(public nav: NavController, public translate: TranslateService) {}

  open(type: string) {
    switch (type) {
      case "projects":
        this.translate.get(['SETTINGS.FEEDBACK.EMAIL.PROJECT', 'SETTINGS.FEEDBACK.EMAIL.PROJECT_TITLE']).subscribe(translations => {
          SocialSharing.shareViaEmail(
            `${translations["SETTINGS.FEEDBACK.EMAIL.PROJECT"]}
            ${Device.device.platform} ${Device.device.version}
            <br>
            ${Device.device.model}
            <br>
            ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}
            <br>
            Cordova ${Device.device.cordova}
            </p>
            `,
            translations["SETTINGS.FEEDBACK.EMAIL.PROJECT_TITLE"],
            ['methoappeei@gmail.com'],
            [],
            [],
            null
          );
        });
        break;
      case "reference":
        this.translate.get(['SETTINGS.FEEDBACK.EMAIL.REFERENCE', 'SETTINGS.FEEDBACK.EMAIL.REFERENCE_TITLE']).subscribe(translations => {
          SocialSharing.shareViaEmail(
            `${translations['SETTINGS.FEEDBACK.EMAIL.REFERENCE']}
            ${Device.device.platform} ${Device.device.version}
            <br>
            ${Device.device.model}
            <br>
            ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}
            <br>
            Cordova ${Device.device.cordova}
            </p>
            `,
            translations["SETTINGS.FEEDBACK.EMAIL.REFERENCE_TITLE"],
            ['methoappeei@gmail.com'],
            [],
            [],
            null
          );
        });
        break;
      case "settings":
        this.translate.get(['SETTINGS.FEEDBACK.EMAIL.SETTINGS', 'SETTINGS.FEEDBACK.EMAIL.SETTINGS_TITLE']).subscribe(translations => {
          SocialSharing.shareViaEmail(
            `${translations["SETTINGS.FEEDBACK.EMAIL.SETTINGS"]}
            ${Device.device.platform} ${Device.device.version}
            <br>
            ${Device.device.model}
            <br>
            ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}
            <br>
            Cordova ${Device.device.cordova}
            </p>
            `,
            translations["SETTINGS.FEEDBACK.EMAIL.SETTINGS_TITLE"],
            ['methoappeei@gmail.com'],
            [],
            [],
            null
          );
        });
        break;
      case "comment":
        this.translate.get(['SETTINGS.FEEDBACK.EMAIL.COMMENT', 'SETTINGS.FEEDBACK.EMAIL.COMMENT_TITLE']).subscribe(translations => {
          SocialSharing.shareViaEmail(
            translations["SETTINGS.FEEDBACK.EMAIL.COMMENT"],
            translations["SETTINGS.FEEDBACK.EMAIL.COMMENT_TITLE"],
            ['methoappeei@gmail.com'],
            [],
            [],
            null
          );
        });
        break;
      case "feature":
        this.translate.get(['SETTINGS.FEEDBACK.EMAIL.FEATURE', 'SETTINGS.FEEDBACK.EMAIL.FEATURE_TITLE']).subscribe(translations => {
          SocialSharing.shareViaEmail(
            translations["SETTINGS.FEEDBACK.EMAIL.FEATURE"],
            translations["SETTINGS.FEEDBACK.EMAIL.FEATURE_TITLE"],
            ['methoappeei@gmail.com'],
            [],
            [],
            null
          );
        });
        break;
    }
  }
}
