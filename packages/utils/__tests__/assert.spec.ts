import { assert } from "../src/assert";

describe("Test assert", () => {
  describe("In Node Environment", () => {
    it("should throw error if assetion fails with message", () => {
      expect(() => assert(false, "Assertion Failed")).toThrow();
    });

    it("should throw error if assetion fails with error", () => {
      expect(() => assert(false, new Error("Assertion Failed"))).toThrow();
    });

    it("should not throw error if assetion hold", () => {
      expect(() => assert(true, "Assertion Failed")).not.toThrow();
    });
  });

  describe("In Browser Environment", () => {
    beforeAll(() => {
      // @ts-expect-error
      global.window = true;
    });

    afterAll(() => {
      // @ts-expect-error
      delete global.window;
    });

    it("should throw error if assetion fails with message", () => {
      expect(() => assert(false, "Assertion Failed")).toThrow();
    });

    it("should throw error if assetion fails with error", () => {
      expect(() => assert(false, new Error("Assertion Failed"))).toThrow();
    });

    it("should not throw error if assetion hold", () => {
      expect(() => assert(true, "Assertion Failed")).not.toThrow();
    });
  });
});
