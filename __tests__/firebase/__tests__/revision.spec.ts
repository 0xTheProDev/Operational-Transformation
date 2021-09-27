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

import { IPlainTextOperation, PlainTextOperation } from "@otjs/plaintext";
import {
  parseRevision,
  revisionToId,
  revisionFromId,
} from "@otjs/firebase-plaintext/src/revision";

describe("Revision", () => {
  describe("Test revisionToId", () => {
    it("should return an Id string from revision", () => {
      expect(revisionToId(6)).toBe("A6");
      expect(revisionToId(10)).toBe("AA");
      expect(revisionToId(101)).toBe("B1d");
    });

    it("should return A0 as starting value from revision", () => {
      expect(revisionToId(0)).toBe("A0");
    });
  });

  describe("Test revisionFromId", () => {
    it("should return an Id string from revision", () => {
      expect(revisionFromId("A6")).toBe(6);
      expect(revisionFromId("AA")).toBe(10);
      expect(revisionFromId("B1d")).toBe(101);
    });

    it("should throw error if empty string is provided", () => {
      expect(() => revisionFromId("")).toThrow();
    });

    it("should throw error if invalid string is provided", () => {
      expect(() => revisionFromId("1Aa")).toThrow();
    });
  });

  describe("Test parseRevision", () => {
    let document: IPlainTextOperation;

    beforeAll(() => {
      document = new PlainTextOperation();
    });

    afterAll(() => {
      // @ts-expect-error
      document = null;
    });

    it("should not throw error if operation is not provided", () => {
      expect(() =>
        parseRevision(
          document,
          // @ts-expect-error
          { a: "Author" }
        )
      ).not.toThrow();
    });

    it("should return null if operation is not provided", () => {
      expect(
        parseRevision(
          document,
          // @ts-expect-error
          { a: "Author" }
        )
      ).toBe(null);
    });

    it("should not throw error if invalid author is provided", () => {
      expect(() =>
        parseRevision(
          document,
          // @ts-expect-error
          { a: 25, o: [5] }
        )
      ).not.toThrow();
    });

    it("should return null if invalid operation is provided", () => {
      expect(
        parseRevision(
          document,
          // @ts-expect-error
          { a: "Author", o: null }
        )
      ).toBe(null);
    });

    it("should return null if it cannot be applied", () => {
      expect(parseRevision(document, { a: "Author", o: [-5] })).toBe(null);
    });

    it("should return Author and Text Operation", () => {
      expect(parseRevision(document, { a: "Author", o: ["Text"] })).toEqual({
        author: "Author",
        operation: new PlainTextOperation().insert("Text"),
      });
    });
  });
});
