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

import { PlainTextOperation } from "@operational-transformation/plaintext";
import { Cursor } from "../src/cursor.impl";

describe("Test Cursor", () => {
  describe(".fromJSON", () => {
    it("should create Cursor object from JSON", () => {
      const cursorData = { position: 5, selectionEnd: 9 };
      const cursor = Cursor.fromJSON(cursorData);
      expect(cursor).toEqual(new Cursor(5, 9));
    });
  });

  describe("#equals", () => {
    it("should check for equality with another cursor with same co-ordinates", () => {
      const cursor = new Cursor(5, 9);
      const otherCursor = new Cursor(5, 9);
      expect(cursor.equals(otherCursor)).toBe(true);
    });

    it("should check for equality with another cursor with different co-ordinates", () => {
      const cursor = new Cursor(5, 9);
      const otherCursor = new Cursor(15, 18);
      expect(cursor.equals(otherCursor)).toBe(false);
    });

    it("should check for equality with invalid value", () => {
      const cursor = new Cursor(5, 9);
      expect(cursor.equals(null)).toBe(false);
    });
  });

  describe("#compose", () => {
    it("should return final cursor", () => {
      const cursor = new Cursor(5, 9);
      const nextCursor = new Cursor(15, 18);
      expect(cursor.compose(nextCursor)).toEqual(nextCursor);
    });
  });

  describe("#transform", () => {
    it("should update cursor based on incoming retain operation", () => {
      const cursor = new Cursor(0, 0);
      const operation = new PlainTextOperation().retain(5);
      const nextCursor = cursor.transform(operation);
      expect(nextCursor).toEqual(new Cursor(0, 0));
    });

    it("should update cursor based on incoming insert operation", () => {
      const cursor = new Cursor(0, 1);
      const operation = new PlainTextOperation().insert("Hello World"); // 11 letters inserted.
      const nextCursor = cursor.transform(operation);
      expect(nextCursor).toEqual(new Cursor(11, 12));
    });

    it("should update cursor based on incoming delete operation", () => {
      const cursor = new Cursor(12, 11);
      const operation = new PlainTextOperation().delete("Hello World"); // 11 letters deleted.
      const nextCursor = cursor.transform(operation);
      expect(nextCursor).toEqual(new Cursor(1, 0));
    });
  });

  describe("#toString", () => {
    it("should pretty print a Cursor", () => {
      const cursor = new Cursor(5, 5);
      expect(cursor.toString()).toBe("Cursor: 5");
    });

    it("should pretty print a Selection", () => {
      const cursor = new Cursor(5, 7);
      expect(cursor.toString()).toBe("Selection: [5, 7]");
    });
  });

  describe("#toJSON", () => {
    it("should convert Cursor object into JSON", () => {
      const cursor = new Cursor(6, 13);
      expect(cursor.toJSON()).toEqual({ position: 6, selectionEnd: 13 });
    });
  });

  describe("#valueOf", () => {
    it("should return starting and ending point of the cursor/selection", () => {
      const cursor = new Cursor(5, 7);
      expect(cursor.valueOf()).toEqual([5, 7]);
    });
  });
});
