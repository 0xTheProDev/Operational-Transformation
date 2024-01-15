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

export class Line {
  protected readonly _textPieces: any[];
  protected readonly _formatting: LineFormatting;

  constructor(textPieces: any = [], formatting?: LineFormatting) {
    this._textPieces = Array.isArray(textPieces) ? textPieces : [textPieces];
    this._formatting = formatting ?? new LineFormatting();
  }
}

export class LineFormatting {
  protected readonly _attributes: Record<LineAttributes, any>;

  constructor(attributes?: Record<LineAttributes, any>) {
    this._attributes = attributes ?? ({} as Record<LineAttributes, any>);
  }

  getAlign() {
    return this._getAttribute(LineAttributes.Align, 0);
  }

  getIndent() {
    return this._getAttribute(LineAttributes.Indent, 0);
  }

  getListItem() {
    return this._getAttribute(LineAttributes.ListItem, ListType.None);
  }

  setAlign(alingValue: AttributeParameter<LineAttributes.Align>) {
    return this._cloneWithNewAttribute(LineAttributes.Align, alingValue);
  }

  setIndent(indentValue: AttributeParameter<LineAttributes.Indent>) {
    return this._cloneWithNewAttribute(LineAttributes.Indent, indentValue);
  }

  setListItem(listType: AttributeParameter<LineAttributes.ListItem>) {
    return this._cloneWithNewAttribute(LineAttributes.ListItem, listType);
  }

  protected _cloneWithNewAttribute<A extends LineAttributes>(
    attribute: A,
    value: AttributeParameter<A>,
  ) {
    const attributes: Record<
      LineAttributes,
      AttributeParameter<A>
    > = {} as Record<LineAttributes, AttributeParameter<A>>;

    // Copy existing.
    for (const attr in this._attributes) {
      attributes[attr as LineAttributes] =
        this._attributes[attr as LineAttributes];
    }

    // Add new one.
    if (value === false) {
      delete attributes[attribute];
    } else {
      attributes[attribute] = value;
    }

    return new LineFormatting(attributes);
  }

  protected _getAttribute<A extends LineAttributes>(
    attribute: A,
    defaultValue: AttributeParameter<A>,
  ): AttributeParameter<A> {
    return this._attributes[attribute] ?? defaultValue;
  }
}
