/**
 * Copyright © 2021 - 2024 Progyan Bhattacharya
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

import { InsertOperation } from "../src/insert-operation";

describe("Insert Operation", () => {
  describe("#isInsert", () => {
    it("should return false", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.isInsert()).toBe(true);
    });
  });

  describe("#isRetain", () => {
    it("should return true", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.isRetain()).toBe(false);
    });
  });

  describe("#isDelete", () => {
    it("should return false", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.isDelete()).toBe(false);
    });
  });

  describe("#equals", () => {
    it("should return false if compared with different Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World");
      const otherInsertOperation = new InsertOperation("Hello Universe");
      expect(insertOperation.equals(otherInsertOperation)).toBe(false);
    });

    it("should return true if compared with same Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World");
      const otherInsertOperation = new InsertOperation("Hello World");
      expect(insertOperation.equals(otherInsertOperation)).toBe(true);
    });
  });

  describe("#attributesEquals", () => {
    it("should return false if compared with different operation attributes", () => {
      const insertOperation = new InsertOperation("Hello World", {
        attr1: "value1",
      });
      expect(insertOperation.attributesEqual({ attr2: "value2" })).toBe(false);
    });

    it("should return false if compared with additional operation attributes", () => {
      const insertOperation = new InsertOperation("Hello World", {
        attr1: "value1",
      });
      expect(
        insertOperation.attributesEqual({ attr1: "value1", attr2: "value2" }),
      ).toBe(false);
    });

    it("should return true if compared with same operation attributes", () => {
      const insertOperation = new InsertOperation("Hello World", {
        attr1: "value1",
      });
      expect(insertOperation.attributesEqual({ attr1: "value1" })).toBe(true);
    });
  });

  describe("#characterCountEqual", () => {
    it("should return false", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.characterCountEqual(26)).toBe(false);
    });
  });

  describe("#textContentEqual", () => {
    it("should return true if parameter is equal with Insert text", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.textContentEqual("Hello World")).toBe(true);
    });

    it("should return false if parameter is not equal with Insert text", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.textContentEqual("Hello Universe")).toBe(false);
    });
  });

  describe("#addCharacterCount", () => {
    it("should throw error", () => {
      const insertOperation = new InsertOperation("Hello World");
      const fn = () => insertOperation.addCharacterCount(20);
      expect(fn).toThrow();
    });
  });

  describe("#addTextContent", () => {
    it("should append text to existing Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World");
      insertOperation.addTextContent("!");
      expect(insertOperation.valueOf()).toBe("Hello World!");
    });
  });

  describe("#setTextContent", () => {
    it("should set text to existing Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World");
      insertOperation.setTextContent("Hello Universe");
      expect(insertOperation.valueOf()).toBe("Hello Universe");
    });
  });

  describe("#characterCount", () => {
    it("should throw error", () => {
      const insertOperation = new InsertOperation("Hello World");
      const fn = () => insertOperation.characterCount();
      expect(fn).toThrow();
    });
  });

  describe("#textContent", () => {
    it("should return number of characters being retained", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.textContent()).toBe("Hello World");
    });
  });

  describe("#hasEmptyAttributes", () => {
    it("should return true if no attributes are present", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.hasEmptyAttributes()).toBe(true);
    });

    it("should return true if empty attribute object is provided", () => {
      const insertOperation = new InsertOperation("Hello World", {});
      expect(insertOperation.hasEmptyAttributes()).toBe(true);
    });

    it("should return false if at least one attribute is present", () => {
      const insertOperation = new InsertOperation("Hello World", {
        attr1: "value1",
      });
      expect(insertOperation.hasEmptyAttributes()).toBe(false);
    });
  });

  describe("#getAttributes", () => {
    it("should return a shallow copy of attributes of the Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World", {
        attr1: "value1",
      });
      expect(insertOperation.getAttributes()).toEqual({ attr1: "value1" });
    });

    it("should return an empty object if no attribute present in the Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.getAttributes()).toEqual({});
    });
  });

  describe("#toString", () => {
    it("should return string representation of Insert operation", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.toString()).toBe('INSERT "Hello World"');
    });
  });

  describe("#valueOf", () => {
    it("should return text being inserted", () => {
      const insertOperation = new InsertOperation("Hello World");
      expect(insertOperation.valueOf()).toBe("Hello World");
    });
  });
});
