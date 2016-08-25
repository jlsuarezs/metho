import {Component} from '@angular/core';
import {ProjectsPage} from '../projects/projects';
import {ReferencesPage} from '../references/references';
import {SettingsPage} from '../settings/settings';

import {TranslateService} from 'ng2-translate/ng2-translate';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  tab1Root: any = ProjectsPage;
  tab2Root: any = ReferencesPage;
  tab3Root: any = SettingsPage;
}
