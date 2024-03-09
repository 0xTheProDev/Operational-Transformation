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

/**
 * Resets all information stored in the mockFn.mock.calls and mockFn.mock.instances arrays.
 *
 * Often this is useful when you want to clean up a mock's usage data between two assertions.
 * @param factoryImpl - Factory Implementation with Mock Functions as methods.
 */
export function clearMock(factoryImpl: Object) {
  Object.values(factoryImpl).forEach((mockFn: jest.Mock) => mockFn.mockClear());
}

/**
 * Resets all information stored in the mock, including any initial implementation and mock name given.
 *
 * This is useful when you want to completely restore a mock back to its initial state.
 * @param factoryImpl - Factory Implementation with Mock Functions as methods.
 */
export function resetMock(factoryImpl: Object) {
  Object.values(factoryImpl).forEach((mockFn: jest.Mock) => mockFn.mockReset());
}
