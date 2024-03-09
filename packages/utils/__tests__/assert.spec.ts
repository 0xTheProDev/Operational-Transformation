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
