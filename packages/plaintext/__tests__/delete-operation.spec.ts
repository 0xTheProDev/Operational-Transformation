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
      expect(fn).toThrowError();
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
      expect(fn).toThrowError();
    });
  });

  describe("#setTextContent", () => {
    it("should throw error", () => {
      const deleteOperation = new DeleteOperation(32);
      const fn = () => deleteOperation.setTextContent("Any Text");
      expect(fn).toThrowError();
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
      expect(fn).toThrowError();
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
