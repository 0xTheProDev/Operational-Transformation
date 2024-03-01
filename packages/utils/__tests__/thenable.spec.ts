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

import { ThenableCollection } from "../src/thenable";

describe("Test Thenable Collection", () => {
  describe("@resolved", () => {
    it("should return true if no Thenable is present in the collection", () => {
      const thenableCollection = new ThenableCollection();
      expect(thenableCollection.resolved).toBe(true);
    });

    it("should return false if any Thenable in the collection is waiting to resolve", () => {
      const thenableCollection = new ThenableCollection(Promise.resolve());
      expect(thenableCollection.resolved).toBe(false);
    });

    it("should return true if all Thenables in the collection have been resolved", async () => {
      const thenableCollection = new ThenableCollection(Promise.resolve());
      await thenableCollection.all();
      expect(thenableCollection.resolved).toBe(true);
    });
  });

  describe("#push", () => {
    it("should add Thenable instance to the collection", async () => {
      const handlerFn = jest.fn();
      const thenableCollection = new ThenableCollection();
      thenableCollection.push(Promise.resolve().then(handlerFn));
      await thenableCollection.all();
      expect(handlerFn).toHaveBeenCalled();
    });

    it("should allow multiple Thenable instances to be added to the collection", async () => {
      const handlerFn = jest.fn();
      const thenableCollection = new ThenableCollection();
      thenableCollection.push(
        Promise.resolve(),
        Promise.resolve().then(handlerFn),
      );
      await thenableCollection.all();
      expect(handlerFn).toHaveBeenCalled();
    });
  });

  describe("#pushSync", () => {
    it("should add Thenable instance to the collection", async () => {
      const handlerFn = jest.fn();
      const thenableCollection = new ThenableCollection();
      thenableCollection.pushSync(() => Promise.resolve().then(handlerFn));
      await thenableCollection.all();
      expect(handlerFn).toHaveBeenCalled();
    });
  });

  describe("#all", () => {
    it("should return a single Thenable comprising of all Theanables in the collection", async () => {
      const thenableCollection = new ThenableCollection(
        Promise.resolve(1),
        Promise.resolve(3),
      );
      const results = (await thenableCollection.all()) as any[];
      const values = results.map((result) => result.value);
      expect(values).toEqual([1, 3]);
    });

    it("should reset Thenable collection", () => {
      const thenableCollection = new ThenableCollection(Promise.resolve());
      thenableCollection.all();
      expect(thenableCollection.resolved).toBe(true);
    });

    it("should not throw error if any Thenable in the collection gets rejected", () => {
      const thenableCollection = new ThenableCollection(
        Promise.resolve(),
        Promise.reject(),
      );
      expect(async () => await thenableCollection.all()).not.toThrow();
    });
  });

  describe("#dispose", () => {
    it("should reset Thenable collection", () => {
      const thenableCollection = new ThenableCollection(Promise.resolve());
      thenableCollection.dispose();
      expect(thenableCollection.resolved).toBe(true);
    });
  });
});
