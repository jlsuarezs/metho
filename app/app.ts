import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {provide, Component} from '@angular/core';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {Http} from '@angular/http';
import {TabsPage} from './pages/tabs/tabs';
import {TranslateLoader, TranslateStaticLoader, TranslateService} from 'ng2-translate/ng2-translate';
import {AppStorage} from './providers/app-storage/app-storage.ts';
import {Parse} from './providers/parse/parse.ts';
import {Fetch} from './providers/fetch/fetch.ts';
import {Settings} from './providers/settings/settings.ts';
import {UserReport} from './providers/user-report/user-report.ts';
import {AdvancedMode} from './providers/advanced-mode/advanced-mode';
import {Language} from './providers/language/language';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, translate: TranslateService, private storage: AppStorage, public settings: Settings, public language: Language) {
    platform.ready().then(() => {
      this.storage.init();
      this.language.init();
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp, [
    provide(TranslateLoader, {
      useFactory: (http: Http) => new TranslateStaticLoader(http, 'i18n/', '.json'),
      deps: [Http]
    }),
    disableDeprecatedForms(),
    provideForms(),
    TranslateService,
    AppStorage,
    Parse,
    Fetch,
    Settings,
    UserReport,
    AdvancedMode,
    Language,
  ], {});
