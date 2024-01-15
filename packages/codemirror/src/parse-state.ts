/**
 * Copyright © 2021 Progyan Bhattacharya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * See LICENSE file in the root directory for more details.
 */

import { AttributeParameter, LineAttributes, ListType } from "./attributes";
import { LineFormatting } from "./line-formatting";
import { TextFormatting } from "./text-formatting";

/**
 * Represents the current parse state as an immutable structure.  To create a new ParseState, use
 * the withXXX methods.
 */
export class ParseState {
  protected readonly _listType: ListType;
  protected readonly _lineFormatting: LineFormatting;
  protected readonly _textFormatting: TextFormatting;

  constructor(
    listType?: ListType,
    lineFormatting?: LineFormatting,
    textFormatting?: TextFormatting,
  ) {
    this._listType = listType ?? ListType.Unordered;
    this._lineFormatting = lineFormatting || new LineFormatting();
    this._textFormatting = textFormatting || new TextFormatting();
  }

  get listType() {
    return this._listType;
  }

  get lineFormatting() {
    return this._lineFormatting;
  }

  get textFormatting() {
    return this._textFormatting;
  }

  withTextFormatting(textFormatting: TextFormatting) {
    return new ParseState(this._listType, this._lineFormatting, textFormatting);
  }

  withLineFormatting(lineFormatting: LineFormatting) {
    return new ParseState(this._listType, lineFormatting, this._textFormatting);
  }

  withListType(listType: ListType) {
    return new ParseState(listType, this._lineFormatting, this._textFormatting);
  }

  withIncreasedIndent(
    increaseBy: AttributeParameter<LineAttributes.Indent> = 1,
  ) {
    const lineFormatting = this._lineFormatting.setIndent(
      this._lineFormatting.getIndent() + increaseBy,
    );
    return new ParseState(this._listType, lineFormatting, this._textFormatting);
  }

  withAlign(align: AttributeParameter<LineAttributes.Align>) {
    const lineFormatting = this._lineFormatting.setAlign(align);
    return new ParseState(this._listType, lineFormatting, this._textFormatting);
  }
}
