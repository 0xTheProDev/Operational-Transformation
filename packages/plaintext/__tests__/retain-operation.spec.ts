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

import { RetainOperation } from "../src/retain-operation";

describe("Retain Operation", () => {
  describe("#isInsert", () => {
    it("should return false", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.isInsert()).toBe(false);
    });
  });

  describe("#isRetain", () => {
    it("should return true", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.isRetain()).toBe(true);
    });
  });

  describe("#isDelete", () => {
    it("should return false", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.isDelete()).toBe(false);
    });
  });

  describe("#equals", () => {
    it("should return false if compared with different Retain operation", () => {
      const retainOperation = new RetainOperation(32);
      const otherRetainOperation = new RetainOperation(26);
      expect(retainOperation.equals(otherRetainOperation)).toBe(false);
    });

    it("should return true if compared with same Retain operation", () => {
      const retainOperation = new RetainOperation(32);
      const otherRetainOperation = new RetainOperation(32);
      expect(retainOperation.equals(otherRetainOperation)).toBe(true);
    });
  });

  describe("#attributesEquals", () => {
    it("should return false if compared with different operation attributes", () => {
      const retainOperation = new RetainOperation(32, { attr1: "value1" });
      expect(retainOperation.attributesEqual({ attr2: "value2" })).toBe(false);
    });

    it("should return false if compared with additional operation attributes", () => {
      const retainOperation = new RetainOperation(32, { attr1: "value1" });
      expect(
        retainOperation.attributesEqual({ attr1: "value1", attr2: "value2" }),
      ).toBe(false);
    });

    it("should return true if compared with same operation attributes", () => {
      const retainOperation = new RetainOperation(32, { attr1: "value1" });
      expect(retainOperation.attributesEqual({ attr1: "value1" })).toBe(true);
    });
  });

  describe("#characterCountEqual", () => {
    it("should return true if parameter is equal with Retain count", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.characterCountEqual(32)).toBe(true);
    });

    it("should return false if parameter is not equal with Retain count", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.characterCountEqual(26)).toBe(false);
    });
  });

  describe("#textContentEqual", () => {
    it("should return false", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.textContentEqual("Any Text")).toBe(false);
    });
  });

  describe("#addCharacterCount", () => {
    it("should add character count to existing Retain operation", () => {
      const retainOperation = new RetainOperation(32);
      retainOperation.addCharacterCount(18);
      expect(retainOperation.valueOf()).toBe(50);
    });
  });

  describe("#addTextContent", () => {
    it("should throw error", () => {
      const retainOperation = new RetainOperation(32);
      const fn = () => retainOperation.addTextContent("Any Text");
      expect(fn).toThrow();
    });
  });

  describe("#setTextContent", () => {
    it("should throw error", () => {
      const retainOperation = new RetainOperation(32);
      const fn = () => retainOperation.setTextContent("Any Text");
      expect(fn).toThrow();
    });
  });

  describe("#characterCount", () => {
    it("should return number of characters being retained", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.characterCount()).toBe(32);
    });
  });

  describe("#textContent", () => {
    it("should throw error", () => {
      const retainOperation = new RetainOperation(32);
      const fn = () => retainOperation.textContent();
      expect(fn).toThrow();
    });
  });

  describe("#hasEmptyAttributes", () => {
    it("should return true if no attributes are present", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.hasEmptyAttributes()).toBe(true);
    });

    it("should return true if empty attribute object is provided", () => {
      const retainOperation = new RetainOperation(32, {});
      expect(retainOperation.hasEmptyAttributes()).toBe(true);
    });

    it("should return false if at least one attribute is present", () => {
      const retainOperation = new RetainOperation(32, { attr1: "value1" });
      expect(retainOperation.hasEmptyAttributes()).toBe(false);
    });
  });

  describe("#getAttributes", () => {
    it("should return a shallow copy of attributes of the Retain operation", () => {
      const retainOperation = new RetainOperation(32, { attr1: "value1" });
      expect(retainOperation.getAttributes()).toEqual({ attr1: "value1" });
    });

    it("should return an empty object if no attribute present in the Retain operation", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.getAttributes()).toEqual({});
    });
  });

  describe("#toString", () => {
    it("should return string representation of Retain operation", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.toString()).toBe("RETAIN 32");
    });
  });

  describe("#valueOf", () => {
    it("should return number of characters being retained", () => {
      const retainOperation = new RetainOperation(32);
      expect(retainOperation.valueOf()).toBe(32);
    });
  });
});
