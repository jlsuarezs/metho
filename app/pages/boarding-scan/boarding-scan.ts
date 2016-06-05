import {Page, NavController, ViewController, Slides} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Settings} from '../../providers/settings/settings';

@Page({
  templateUrl: 'build/pages/boarding-scan/boarding-scan.html',
  pipes: [TranslatePipe]
})
export class BoardingScanPage {
  @ViewChild('slider') slider: Slides;
  public currentIndex: number = 0;
  public swiperOptions: any;

  constructor(public viewCtrl: ViewController, public settings: Settings) {
    this.swiperOptions = {
      parallax: true,
      keyboardControl: true
    }
  }

  dismiss() {
    this.settings.set('scanBoardingDone', true);
    this.viewCtrl.dismiss();
  }

  onSlideChange() {
    this.currentIndex = this.slider.getActiveIndex();
  }
}
