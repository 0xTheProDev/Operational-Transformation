/**
 * @jest-environment jsdom
 */

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

import {
  addStyleRule,
  createTooltipNode,
  createWidgetNode,
} from "../src/styles";

describe("Style Utility Functions", () => {
  describe("Test addStyleRule", () => {
    let appendChildSpy: jest.SpyInstance<Node, [node: Node]>;

    beforeAll(() => {
      appendChildSpy = jest.spyOn(document.head, "appendChild");
    });

    afterEach(() => {
      appendChildSpy.mockReset();
    });

    afterAll(() => {
      appendChildSpy.mockRestore();
    });

    it("should inject style rules to Document", async () => {
      await addStyleRule({
        className: "test-class",
        cursorColor: "#000",
      });
      expect(appendChildSpy.mock.calls).toMatchInlineSnapshot(`
        [
          [
            <style>
              
            /**
             * Copyright © 2021 - 2024 Progyan Bhattacharya
             * Licensed under the MIT License.
             * See LICENSE in the project root for license information.
             */

            .test-class-cursor {
              position: absolute;
              background-color: transparent;
              border-left: 2px solid #000;
            }

            .test-class-selection {
              position: absolute;
              opacity: 0.5;
              background-color: #000;
              border-left: 2px solid #000;
            }

            .test-class-tooltip {
              opacity: 1;
              padding: 2px 8px;
              font-size: 12px;
              white-space: nowrap;
              border-radius: 2px;
              color: #ffffff;
              border-color: #000;
              background-color: #000;
            }

            .test-class-widget {
              height: 20px;
              padding-bottom: 0 !important;
              position: absolute;
              transition: all 0.1s linear;
              z-index: 10000;
            }
          
            </style>,
          ],
        ]
      `);
    });

    it("should not inject same style rules twice", async () => {
      await addStyleRule({
        className: "test-class",
        cursorColor: "#000",
      });
      expect(appendChildSpy).not.toHaveBeenCalled();
    });

    it("should retry if DOM update fails once", async () => {
      appendChildSpy.mockImplementationOnce(() => {
        throw new DOMException();
      });

      await addStyleRule({
        className: "test-class2",
        cursorColor: "#000",
      });
      expect(appendChildSpy).toHaveBeenCalledTimes(2);
    });

    it("should throw error if DOM update fails more than once", () => {
      appendChildSpy.mockImplementation(() => {
        throw new DOMException();
      });

      const promise = addStyleRule({
        className: "test-class3",
        cursorColor: "#000",
      });

      expect(promise).rejects.toThrow();
    });
  });

  describe("Test createTooltipNode", () => {
    let createElementSpy: jest.SpyInstance<
      HTMLElement,
      [tagname: string, options?: ElementCreationOptions | undefined]
    >;

    beforeAll(() => {
      createElementSpy = jest.spyOn(document, "createElement");
    });

    afterEach(() => {
      createElementSpy.mockReset();
    });

    afterAll(() => {
      createElementSpy.mockRestore();
    });

    it("should create a tootip", async () => {
      const tooltip = await createTooltipNode({
        className: "test-class",
        textContent: "user-name",
      });
      expect(tooltip).toMatchInlineSnapshot(`
        <div
          class="test-class"
          role="tooltip"
        >
          user-name
        </div>
      `);
    });

    it.skip("should retry if DOM update fails once", async () => {
      createElementSpy.mockImplementationOnce(() => {
        throw new DOMException();
      });

      await createTooltipNode({
        className: "test-class2",
        textContent: "user-name",
      });
      expect(createElementSpy).toHaveBeenCalledTimes(2);
    });

    it("should throw error if DOM update fails more than once", () => {
      createElementSpy.mockImplementation(() => {
        throw new DOMException();
      });

      const promise = createTooltipNode({
        className: "test-class3",
        textContent: "user-name",
      });

      expect(promise).rejects.toThrow();
    });
  });

  describe("Test createWidgetNode", () => {
    let childElement: HTMLElement,
      createElementSpy: jest.SpyInstance<
        HTMLElement,
        [tagname: string, options?: ElementCreationOptions | undefined]
      >;

    beforeAll(() => {
      childElement = document.createElement("div");
      createElementSpy = jest.spyOn(document, "createElement");
    });

    afterEach(() => {
      createElementSpy.mockReset();
    });

    afterAll(() => {
      createElementSpy.mockRestore();
      childElement.remove();
    });

    it("should create a widget", async () => {
      const tooltip = await createWidgetNode({
        className: "test-class",
        childElement,
      });
      expect(tooltip).toMatchInlineSnapshot(`
        <div
          class="test-class"
        >
          <div />
        </div>
      `);
    });

    it.skip("should retry if DOM update fails once", async () => {
      createElementSpy.mockImplementationOnce(() => {
        throw new DOMException();
      });

      await createWidgetNode({
        className: "test-class2",
        childElement,
      });
      expect(createElementSpy).toHaveBeenCalledTimes(2);
    });

    it("should throw error if DOM update fails more than once", () => {
      createElementSpy.mockImplementation(() => {
        throw new DOMException();
      });

      const promise = createWidgetNode({
        className: "test-class3",
        childElement,
      });

      expect(promise).rejects.toThrow();
    });
  });
});
