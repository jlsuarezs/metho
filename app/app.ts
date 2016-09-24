import { provide, Component, PLATFORM_PIPES } from '@angular/core';
import { Http } from '@angular/http';
import { disableDeprecatedForms, provideForms } from '@angular/forms';

import { Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { TranslateLoader, TranslateStaticLoader, TranslateService, TranslatePipe } from 'ng2-translate/ng2-translate';

import { TabsPage } from './pages/tabs/tabs';

import { AdvancedMode } from './providers/advanced-mode/advanced-mode';
import { AppStorage } from './providers/app-storage/app-storage';
import { Fetch } from './providers/fetch/fetch';
import { Language } from './providers/language/language';
import { Parse } from './providers/parse/parse';
import { References } from './providers/references/references';
import { Report } from './providers/report/report';
import { Scan } from './providers/scan/scan';
import { Settings } from './providers/settings/settings';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(
    public platform: Platform,
    public storage: AppStorage,
    public language: Language,
  ) {
    this.platform.ready().then(() => {
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
    References,
    Settings,
    Report,
    AdvancedMode,
    Language,
    Scan,
    provide(PLATFORM_PIPES, {
      useValue: [
        TranslatePipe
      ],
      multi: true
    }),
  ], { prodMode: window.hasOwnProperty("cordova") });
