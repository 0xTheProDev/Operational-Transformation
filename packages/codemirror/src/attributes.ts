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

/**
 * Text Attributes for Rich Text Content.
 */
export const enum TextAttributes {
  Bold = "b",
  Italic = "i",
  UnderLine = "u",
  Strike = "s",
  Font = "f",
  FontSize = "fs",
  Color = "c",
  BackgroundColor = "bc",
  EntitySentinel = "ent",
}

/**
 * Line Attributes for Rich Text Content.
 */
export const enum LineAttributes {
  Sentinel = "l",
  Indent = "li",
  Align = "la",
  ListItem = "lt",
}

/**
 * List Types for Rich Text Content.
 */
export const enum ListType {
  None = 0,
  Ordered = "o",
  Unordered = "u",
  Todo = "t",
  TodoChecked = "tc",
}

type AttributeParameterMap = {
  [LineAttributes.Align]: number;
  [LineAttributes.Indent]: number;
  [LineAttributes.ListItem]: ListType;
};

export type AttributeParameter<A> = A extends keyof AttributeParameterMap
  ? AttributeParameterMap[A]
  : unknown;
