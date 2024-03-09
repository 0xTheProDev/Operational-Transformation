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

import { Disposable, DisposableCollection } from "../src/disposable";

describe("Disposable", () => {
  describe("Test create", () => {
    it("should transform callback as argument into Disposable instance", () => {
      const cleanupFn = jest.fn();
      const cancelable = Disposable.create(cleanupFn);
      cancelable.dispose();
      expect(cleanupFn).toHaveBeenCalled();
    });
  });

  describe("Test Disposable Collection", () => {
    describe("@disposed", () => {
      it("return true for empty collection of Disposable", () => {
        const disposableCollection = new DisposableCollection();
        expect(disposableCollection.disposed).toBe(true);
      });

      it("return false for non-empty collection of Disposable", () => {
        const disposableCollection = new DisposableCollection(
          Disposable.create(() => {}),
        );
        expect(disposableCollection.disposed).toBe(false);
      });

      it("return true for disposed collection of Disposable", () => {
        const disposableCollection = new DisposableCollection(
          Disposable.create(() => {}),
        );
        disposableCollection.dispose();
        expect(disposableCollection.disposed).toBe(true);
      });
    });

    describe("#push", () => {
      it("should add Disposable instance to the collection", () => {
        const cleanupFn = jest.fn();
        const disposableCollection = new DisposableCollection();
        disposableCollection.push(Disposable.create(cleanupFn));
        disposableCollection.dispose();
        expect(cleanupFn).toHaveBeenCalled();
      });

      it("should allow multiple Disposable instances to be added to the collection", () => {
        const cleanupFn = jest.fn();
        const disposableCollection = new DisposableCollection();
        disposableCollection.push(
          Disposable.create(() => {}),
          Disposable.create(cleanupFn),
        );
        disposableCollection.dispose();
        expect(cleanupFn).toHaveBeenCalled();
      });
    });

    describe("#dispose", () => {
      it("should dispose each Disposable instance", () => {
        const cleanupFn = jest.fn();
        const disposableCollection = new DisposableCollection(
          Disposable.create(cleanupFn),
        );
        disposableCollection.dispose();
        expect(cleanupFn).toHaveBeenCalled();
      });

      it("should reset Disposable collection", () => {
        const disposableCollection = new DisposableCollection(
          Disposable.create(() => {}),
        );
        disposableCollection.dispose();
        expect(disposableCollection.disposed).toBe(true);
      });

      it("should return gracefuly if canceled already", () => {
        const disposableCollection = new DisposableCollection(
          Disposable.create(() => {}),
        );
        disposableCollection.dispose();
        expect(() => disposableCollection.dispose()).not.toThrow();
      });
    });
  });
});
