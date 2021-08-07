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
        retainOperation.attributesEqual({ attr1: "value1", attr2: "value2" })
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
      expect(fn).toThrowError();
    });
  });

  describe("#setTextContent", () => {
    it("should throw error", () => {
      const retainOperation = new RetainOperation(32);
      const fn = () => retainOperation.setTextContent("Any Text");
      expect(fn).toThrowError();
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
      expect(fn).toThrowError();
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
