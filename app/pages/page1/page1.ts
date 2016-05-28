import {Page, NavController} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/page1/page1.html',
})
export class Page1 {
  constructor(public nav: NavController) {
    this.nav = nav;
  }
}
