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

import { TextAttributes } from "./attributes";

const EntitySentinelPrefix = `${TextAttributes.EntitySentinel}_` as const;
const EntitySentinelPrefixLength = EntitySentinelPrefix.length;

export class Entity {
  protected readonly _type: keyof HTMLElementTagNameMap;
  protected readonly _info: Record<string, string>;

  constructor(type: keyof HTMLElementTagNameMap, info: Record<string, string>) {
    this._type = type;
    this._info = info ?? {};
  }

  get type() {
    return this._type;
  }

  get info() {
    return this._info;
  }

  toAttributes() {
    const attributes = {
      [TextAttributes.EntitySentinel]: this._type,
    } as any;

    for (const attr in this._info) {
      attributes[`${EntitySentinelPrefix}${attr}`] = this._info[attr];
    }

    return attributes;
  }

  static fromAttributes(
    attributes: Record<string, keyof HTMLElementTagNameMap>,
  ) {
    const type = attributes[TextAttributes.EntitySentinel];
    const info = {} as Record<string, string>;

    for (const attr in attributes) {
      if (attr.startsWith(EntitySentinelPrefix)) {
        info[attr.substring(EntitySentinelPrefixLength)] = attributes[attr];
      }
    }

    return new Entity(type, info);
  }
}
