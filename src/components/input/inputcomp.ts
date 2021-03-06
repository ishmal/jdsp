import {Component} from 'angular2/core';

import {DigiService} from '../../services/digiservice';
import {Digi, InText} from '../../lib/digi';

@Component({
    selector: 'jdigi-input',
    template: '<textarea class=\'console-area col-md-12\'>{{text}}</textarea>',
    styles: [
      `
      .console-area {
         overflow-y: scroll;
         height: 70px;
         resize: none;
         background-color: #eeaaaa;
      }
      `
    ]
})
export class InputComponent extends InText {

  _digi: Digi;
  _text: string;

  constructor(digiService: DigiService) {
    super();
    this._digi = digiService.digi;
    this._text = '';
    this._digi.inText = this;
  }

  get text(): string {
    return this._text;
  }

  /**
   * @Override InputText
   */
  clear():void {
    this._text = '';
  }

  /**
   * @Override InputText
   */
  getText(): string {
    return this._text;
  }


}
