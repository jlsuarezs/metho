import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {provide, Component} from '@angular/core';
import {Http} from '@angular/http';
import {TabsPage} from './pages/tabs/tabs';
import {TranslateLoader, TranslateStaticLoader, TranslateService} from 'ng2-translate/ng2-translate';
import {AppStorage} from './providers/app-storage/app-storage.ts';
import {Parse} from './providers/parse/parse.ts';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, translate: TranslateService, private storage: AppStorage) {
    platform.ready().then(() => {
      this.storage.init();
      translate.setDefaultLang('en');
      translate.use('fr');
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp, [
    provide(TranslateLoader, {
      useFactory: (http: Http) => new TranslateStaticLoader(http, 'i18n/', '.json'),
      deps: [Http]
    }),
    TranslateService,
    AppStorage,
    Parse
  ], {});
