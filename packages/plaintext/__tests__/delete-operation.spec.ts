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

import { DeleteOperation } from "../src/delete-operation";

describe("Delete Operation", () => {
  describe("#isInsert", () => {
    it("should return false", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.isInsert()).toBe(false);
    });
  });

  describe("#isRetain", () => {
    it("should return true", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.isRetain()).toBe(false);
    });
  });

  describe("#isDelete", () => {
    it("should return false", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.isDelete()).toBe(true);
    });
  });

  describe("#equals", () => {
    it("should return false if compared with different Delete operation", () => {
      const deleteOperation = new DeleteOperation(32);
      const otherDeleteOperation = new DeleteOperation(26);
      expect(deleteOperation.equals(otherDeleteOperation)).toBe(false);
    });

    it("should return true if compared with same Delete operation", () => {
      const deleteOperation = new DeleteOperation(32);
      const otherDeleteOperation = new DeleteOperation(32);
      expect(deleteOperation.equals(otherDeleteOperation)).toBe(true);
    });
  });

  describe("#attributesEquals", () => {
    it("should throw error", () => {
      const deleteOperation = new DeleteOperation(32);
      const fn = () => deleteOperation.attributesEqual({ attr2: "value2" });
      expect(fn).toThrow();
    });
  });

  describe("#characterCountEqual", () => {
    it("should return true if parameter is equal with Delete count", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.characterCountEqual(32)).toBe(true);
    });

    it("should return false if parameter is not equal with Delete count", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.characterCountEqual(26)).toBe(false);
    });
  });

  describe("#textContentEqual", () => {
    it("should return false", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.textContentEqual("Any Text")).toBe(false);
    });
  });

  describe("#addCharacterCount", () => {
    it("should add character count to existing Delete operation", () => {
      const deleteOperation = new DeleteOperation(32);
      deleteOperation.addCharacterCount(18);
      expect(deleteOperation.valueOf()).toBe(-50);
    });
  });

  describe("#addTextContent", () => {
    it("should throw error", () => {
      const deleteOperation = new DeleteOperation(32);
      const fn = () => deleteOperation.addTextContent("Any Text");
      expect(fn).toThrow();
    });
  });

  describe("#setTextContent", () => {
    it("should throw error", () => {
      const deleteOperation = new DeleteOperation(32);
      const fn = () => deleteOperation.setTextContent("Any Text");
      expect(fn).toThrow();
    });
  });

  describe("#characterCount", () => {
    it("should return number of characters being retained", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.characterCount()).toBe(32);
    });
  });

  describe("#textContent", () => {
    it("should throw error", () => {
      const deleteOperation = new DeleteOperation(32);
      const fn = () => deleteOperation.textContent();
      expect(fn).toThrow();
    });
  });

  describe("#hasEmptyAttributes", () => {
    it("should return true", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.hasEmptyAttributes()).toBe(true);
    });
  });

  describe("#getAttributes", () => {
    it("should return null", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.getAttributes()).toBe(null);
    });
  });

  describe("#toString", () => {
    it("should return string representation of Delete operation", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.toString()).toBe("DELETE 32");
    });
  });

  describe("#valueOf", () => {
    it("should return number of characters being deleted", () => {
      const deleteOperation = new DeleteOperation(32);
      expect(deleteOperation.valueOf()).toBe(-32);
    });
  });
});
