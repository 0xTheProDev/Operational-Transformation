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

import { Cancelable, CancelableCollection } from "../src/cancelable";

describe("Cancelable", () => {
  describe("Test create", () => {
    it("should transform callback as argument into Cancelable instance", () => {
      const cleanupFn = jest.fn();
      const cancelable = Cancelable.create(cleanupFn);
      cancelable.cancel();
      expect(cleanupFn).toHaveBeenCalled();
    });
  });

  describe("Test Cancelable Collection", () => {
    describe("@canceled", () => {
      it("return true for empty collection of Cancelable", () => {
        const cancelableCollection = new CancelableCollection();
        expect(cancelableCollection.canceled).toBe(true);
      });

      it("return false for non-empty collection of Cancelable", () => {
        const cancelableCollection = new CancelableCollection(
          Cancelable.create(() => {}),
        );
        expect(cancelableCollection.canceled).toBe(false);
      });

      it("return true for canceled collection of Cancelable", () => {
        const cancelableCollection = new CancelableCollection(
          Cancelable.create(() => {}),
        );
        cancelableCollection.cancel();
        expect(cancelableCollection.canceled).toBe(true);
      });
    });

    describe("#push", () => {
      it("should add Cancelable instance to the collection", () => {
        const cleanupFn = jest.fn();
        const cancelableCollection = new CancelableCollection();
        cancelableCollection.push(Cancelable.create(cleanupFn));
        cancelableCollection.cancel();
        expect(cleanupFn).toHaveBeenCalled();
      });

      it("should allow multiple Cancelable instances to be added to the collection", () => {
        const cleanupFn = jest.fn();
        const cancelableCollection = new CancelableCollection();
        cancelableCollection.push(
          Cancelable.create(() => {}),
          Cancelable.create(cleanupFn),
        );
        cancelableCollection.cancel();
        expect(cleanupFn).toHaveBeenCalled();
      });
    });

    describe("#forEach", () => {
      it("allows custom callback to run against all Cancelable instances in the collection", () => {
        const cancelable = {
          cancel() {},
          remove: jest.fn(),
        };
        const cancelableCollection = new CancelableCollection(cancelable);
        cancelableCollection.forEach((item: unknown) =>
          (item as { remove: () => void }).remove(),
        );
        expect(cancelable.remove).toHaveBeenCalled();
      });
    });

    describe("#cancel", () => {
      it("should cancel each Cancelable instance", () => {
        const cleanupFn = jest.fn();
        const cancelableCollection = new CancelableCollection(
          Cancelable.create(cleanupFn),
        );
        cancelableCollection.cancel();
        expect(cleanupFn).toHaveBeenCalled();
      });

      it("should reset Cancelable collection", () => {
        const cancelableCollection = new CancelableCollection(
          Cancelable.create(() => {}),
        );
        cancelableCollection.cancel();
        expect(cancelableCollection.canceled).toBe(true);
      });

      it("should return gracefuly if canceled already", () => {
        const cancelableCollection = new CancelableCollection(
          Cancelable.create(() => {}),
        );
        cancelableCollection.cancel();
        expect(() => cancelableCollection.cancel()).not.toThrow();
      });
    });
  });
});
