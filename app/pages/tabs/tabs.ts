import {Component} from '@angular/core';
import {ProjectsPage} from '../projects/projects';
import {ReferencesPage} from '../references/references';
import {SettingsPage} from '../settings/settings';

import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html',
  pipes: [TranslatePipe]
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = ProjectsPage;
  tab2Root: any = ReferencesPage;
  tab3Root: any = SettingsPage;
}
