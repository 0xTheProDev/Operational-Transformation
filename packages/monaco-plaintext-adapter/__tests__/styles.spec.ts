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

import { addStyleRule } from "../src/styles";

describe("Style Utility Functions", () => {
  let appendChildSpy: jest.SpyInstance<Node, [Node]>;

  beforeAll(() => {
    appendChildSpy = jest.spyOn(document.head, "appendChild");
  });

  afterEach(() => {
    appendChildSpy.mockReset();
  });

  afterAll(() => {
    appendChildSpy.mockRestore();
  });

  describe("Test addStyleRule", () => {
    it("should inject style rules to Document", async () => {
      await addStyleRule({
        opacity: 1,
        className: "test-class",
        cursorColor: "#000",
        hightlightColor: "transparent",
      });
      expect(appendChildSpy.mock.calls).toMatchSnapshot();
    });

    it("should not inject same style rules twice", async () => {
      await addStyleRule({
        opacity: 1,
        className: "test-class",
        cursorColor: "#000",
        hightlightColor: "transparent",
      });
      expect(appendChildSpy).not.toHaveBeenCalled();
    });

    it("should retry if DOM update fails once", async () => {
      appendChildSpy
        .mockImplementationOnce(() => {
          throw new DOMException();
        })
        .mockImplementationOnce((node: Node) => node);

      await addStyleRule({
        opacity: 1,
        className: "test-class2",
        cursorColor: "#000",
        hightlightColor: "transparent",
      });
      expect(appendChildSpy).toHaveBeenCalledTimes(2);
    });

    it("should throw error if DOM update fails more than once", () => {
      appendChildSpy.mockImplementation(() => {
        throw new DOMException();
      });

      const promise = addStyleRule({
        opacity: 1,
        className: "test-class3",
        cursorColor: "#000",
        hightlightColor: "transparent",
      });

      expect(promise).rejects.toThrow();
    });
  });
});
