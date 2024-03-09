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

import { memoize } from "../src/memoize";

describe("Test memoize function", () => {
  it("should call original function at least once", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn);
    memoizedFn(1, 2);
    expect(mockFn).toHaveBeenCalled();
  });

  it("should not call original function twice for same parameter", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn);
    memoizedFn(1, 2);
    memoizedFn(1, 2);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should allow external function to set key", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn, (..._args) => 0);
    memoizedFn(1, 2);
    memoizedFn(1, 2);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should not memoize return values if arity is zero", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn);
    memoizedFn();
    memoizedFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should not memoize return values if parameters are object", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn);
    memoizedFn({ a: 1 });
    memoizedFn({ a: 1 });
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should not memoize return values if null is set as key", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn, (..._args) => null);
    memoizedFn(1, 2);
    memoizedFn(1, 2);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should allow clean up of cache", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn);
    memoizedFn(1, 2);
    memoizedFn.dispose();
    memoizedFn(1, 2);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should not throw if clean up done twice", () => {
    const mockFn = jest.fn();
    const memoizedFn = memoize(mockFn);
    memoizedFn(1, 2);
    memoizedFn.dispose();
    expect(() => memoizedFn.dispose()).not.toThrow();
  });
});
