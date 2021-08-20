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

import { PlainTextOperation } from "@ot/plaintext";
import { Cursor } from "../src/cursor.impl";
import { OperationMetadata } from "../src/operation-metadata.impl";

describe("Operation Metadata", () => {
  describe("#clone", () => {
    it("should create deep clone of Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMetadata(cursorBefore, cursorAfter);
      expect(operationMeta.clone()).toEqual(operationMeta);
    });
  });

  describe("#invert", () => {
    it("should swap properties of Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMetadata(cursorBefore, cursorAfter);
      const invertMeta = new OperationMetadata(cursorAfter, cursorBefore);
      expect(operationMeta.invert()).toEqual(invertMeta);
    });
  });

  describe("#compose", () => {
    it("should merge properties of two Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMetadata(cursorBefore, cursorAfter);

      const cursorBeforeOther = new Cursor(3, 3);
      const cursorAfterOther = new Cursor(4, 9);
      const operationMetaOther = new OperationMetadata(
        cursorBeforeOther,
        cursorAfterOther
      );

      const composedMeta = new OperationMetadata(
        cursorBefore,
        cursorAfterOther
      );
      expect(operationMeta.compose(operationMetaOther)).toEqual(composedMeta);
    });
  });

  describe("#transform", () => {
    it("should transform properties of Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMetadata(cursorBefore, cursorAfter);

      const operation = new PlainTextOperation().insert("Hello World"); // 11 letters inserted.
      const cursorBeforeTransformed = new Cursor(12, 15);
      const cursorAfterTransformed = new Cursor(13, 19);

      const transformedMeta = new OperationMetadata(
        cursorBeforeTransformed,
        cursorAfterTransformed
      );
      expect(operationMeta.transform(operation)).toEqual(transformedMeta);
    });

    it("should not throw error for null values", () => {
      const operationMeta = new OperationMetadata(null, null);
      const operation = new PlainTextOperation().retain(12);
      const fn = () => operationMeta.transform(operation);
      expect(fn).not.toThrowError();
    });
  });

  describe("#getCursor", () => {
    it("should return final position of the Cursor", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMetadata(cursorBefore, cursorAfter);
      expect(operationMeta.getCursor()).toEqual(cursorAfter);
    });
  });
});
