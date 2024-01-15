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

import { AttributeParameter, TextAttributes } from "./attributes";

export class TextFormatting {
  protected readonly _attributes: Record<TextAttributes, any>;

  constructor(attributes?: Record<TextAttributes, any>) {
    this._attributes = attributes ?? ({} as Record<TextAttributes, any>);
  }

  backgroundColor(value: any) {
    this._cloneWithNewAttribute(TextAttributes.BackgroundColor, value);
  }

  bold(value: any) {
    this._cloneWithNewAttribute(TextAttributes.Bold, value);
  }

  color(value: any) {
    this._cloneWithNewAttribute(TextAttributes.Color, value);
  }

  font(value: any) {
    this._cloneWithNewAttribute(TextAttributes.Font, value);
  }

  fontSize(value: any) {
    this._cloneWithNewAttribute(TextAttributes.FontSize, value);
  }

  italic(value: any) {
    this._cloneWithNewAttribute(TextAttributes.Italic, value);
  }

  strike(value: any) {
    this._cloneWithNewAttribute(TextAttributes.Strike, value);
  }

  underline(value: any) {
    this._cloneWithNewAttribute(TextAttributes.UnderLine, value);
  }

  protected _cloneWithNewAttribute<A extends TextAttributes>(
    attribute: A,
    value: AttributeParameter<A>,
  ) {
    const attributes: Record<
      TextAttributes,
      AttributeParameter<A>
    > = {} as Record<TextAttributes, AttributeParameter<A>>;

    // Copy existing.
    for (const attr in this._attributes) {
      attributes[attr as TextAttributes] =
        this._attributes[attr as TextAttributes];
    }

    // Add new one.
    if (value === false) {
      delete attributes[attribute];
    } else {
      attributes[attribute] = value;
    }

    return new TextFormatting(attributes);
  }
}
