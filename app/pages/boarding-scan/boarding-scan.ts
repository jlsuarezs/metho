import {NavController, ViewController, Slides} from 'ionic-angular';
import {ViewChild, Component} from '@angular/core';

import {Settings} from '../../providers/settings/settings';

@Component({
  templateUrl: 'build/pages/boarding-scan/boarding-scan.html'
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
