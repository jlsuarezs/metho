import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';

import { AppStorage } from '../providers/app-storage';
import { Language } from '../providers/language';


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
      this.language.init();
      this.storage.init();
      StatusBar.styleDefault();
    });
  }
}
