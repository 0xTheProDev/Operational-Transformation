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

import { ListType } from "./attributes";
import { Line } from "./line-formatting";
import { ParseState } from "./parse-state";

/**
 * Mutable structure representing the current parse output.
 */
export class ParseOutput {
  protected readonly _lines: Line[];

  protected _currentLine: Line[];
  protected _currentLineListItemType: ListType | null;

  constructor() {
    this._lines = [];
    this._currentLine = [];
    this._currentLineListItemType = null;
  }

  get lines() {
    return this._lines;
  }

  newlineIfNonEmpty(state: ParseState) {
    this._cleanLine();
    if (this._currentLine.length > 0) {
      this.newline(state);
    }
  }

  newlineIfNonEmptyOrListItem(state: ParseState) {
    this._cleanLine();
    if (
      this._currentLine.length > 0 ||
      this._currentLineListItemType !== null
    ) {
      this.newline(state);
    }
  }

  newline(state: ParseState) {
    this._cleanLine();
    let lineFormatting = state.lineFormatting;
    if (this._currentLineListItemType !== null) {
      lineFormatting = lineFormatting.setListItem(
        this._currentLineListItemType,
      );
      this._currentLineListItemType = null;
    }

    this._lines.push(new Line(this._currentLine, lineFormatting));
    this._currentLine = [];
  }

  makeListItem(type: ListType) {
    this._currentLineListItemType = type;
  }

  protected _cleanLine() {
    // Kinda' a hack, but we remove leading and trailing spaces (since these aren't significant in html) and
    // replaces nbsp's with normal spaces.
    if (this._currentLine.length > 0) {
      const last = this._currentLine.length - 1;
      this._currentLine[0].text = this._currentLine[0].text.replace(/^ +/, "");
      this._currentLine[last].text = this._currentLine[last].text.replace(
        / +$/g,
        "",
      );
      for (let i = 0; i < this._currentLine.length; i++) {
        this._currentLine[i].text = this._currentLine[i].text.replace(
          /\u00a0/g,
          " ",
        );
      }
    }
    // If after stripping trailing whitespace, there's nothing left, clear currentLine out.
    if (this._currentLine.length === 1 && this._currentLine[0].text === "") {
      this._currentLine = [];
    }
  }
}
