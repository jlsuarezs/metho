import {ViewController, NavParams} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {Component} from '@angular/core';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';

import {AppStorage} from '../../providers/app-storage/app-storage.ts';
import {Parse} from '../../providers/parse/parse.ts';
import {Language} from '../../providers/language/language';

@Component({
  templateUrl: 'build/pages/source-modal-article/source-modal-article.html',
  pipes: [TranslatePipe]
})
export class SourceModalArticlePage {
  public isNew: boolean;
  public noData: boolean;
  public previous: any;
  public pendingId: string;
  public projectId: string;
  public currentTransition: any;
  public hasConfirmed: boolean = false;

  public form: ControlGroup;

  constructor(public viewCtrl: ViewController, public params: NavParams, public parse: Parse, public storage: AppStorage, public fb: FormBuilder) {
    if(this.params.get('editing') == true) {
      this.isNew = false;
    }else {
      this.isNew = true;
    }

    if (typeof this.params.get('data') !== "undefined") {
      this.noData = false;
      this.previous = this.params.get('data');
    }else {
      this.noData = true;
    }
    this.projectId = this.params.get('projectId');

    if (typeof this.params.get('pendingId') !== "undefined") {
      this.pendingId = this.params.get('pendingId');
    }

    this.form = fb.group({
      author1firstname: [this.noData ? '' : this.previous.author1firstname],
      author1lastname: [this.noData ? '' : this.previous.author1lastname],
      title: [this.noData ? '' : this.previous.title],
      editor: [this.noData ? '' : this.previous.editor],
      editionNumber: [this.noData ? '' : this.previous.editionNumber],
      publicationDate: [this.noData ? '' : this.previous.publicationDate],
      startPage: [this.noData ? '' : this.previous.startPage],
      endPage: [this.noData ? '' : this.previous.endPage]
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submitIfEnter(event) {
    if (event.keyCode == 13 && !this.hasConfirmed) {
      this.confirm();
      this.hasConfirmed = true;
    }
  }

  confirm() {
    let values = this.form.value;
    values.type = 'article';
    let parsed = this.parse.parse(values);
    parsed.project_id = this.projectId;

    if (this.isNew) {
      this.storage.createSource(parsed);
      if (this.pendingId) {
        this.storage.deletePending(this.pendingId);
      }
    }else {
      this.storage.setSourceFromId(this.previous._id, parsed);
    }

    this.viewCtrl.dismiss();
  }
}
