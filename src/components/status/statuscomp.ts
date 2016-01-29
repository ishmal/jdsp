import {Component} from 'angular2/core';

import {DigiService} from '../../services/digiservice';
import {Digi, OutText} from '../../lib/digi';

@Component({
    selector: 'jdigi-status',
    template: '<textarea>{{text}}</textarea>'
})
export class StatusComponent extends OutText {

  _digi: Digi;
  _text: string;

  constructor(digiService: DigiService) {
    super();
    this._digi = digiService.digi;
    this._text = "";
    this._digi.statText = this;
  }

  get text(): string {
    return this._text;
  }

  /**
   * @Override OutputText
   */
  clear():void {
    this._text = "";
  }

  /**
   * @Override OutputText
   */
  putText(str: string) {
    this._text += str;
  }


}
