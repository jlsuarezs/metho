import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {provide} from '@angular/core';
import {Http} from '@angular/http';
import {TabsPage} from './pages/tabs/tabs';
import {TranslateLoader, TranslateStaticLoader, TranslateService} from 'ng2-translate/ng2-translate';


@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  config: {},
  providers: [
    provide(TranslateLoader, {
      useFactory: (http: Http) => new TranslateStaticLoader(http, 'i18n/', '.json'),
      deps: [Http]
    }),
    TranslateService
  ]
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, translate: TranslateService) {
    platform.ready().then(() => {
      translate.setDefaultLang('en');
      translate.use('fr');
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}
