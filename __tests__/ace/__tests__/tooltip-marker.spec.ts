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

import { TooltipMarker } from "@otjs/ace/src/tooltip-marker";

describe("Test Tooltip Marker", () => {
  let aceEditor: AceAjax.Editor,
    aceSession: AceAjax.IEditSession,
    tooltipWidget: HTMLElement,
    layerConfig: any,
    markerLayer: any;

  beforeAll(() => {
    const containerEl = document.createElement("div");
    document.body.appendChild(containerEl);
    aceEditor = ace.edit(containerEl);
    aceSession = aceEditor.getSession();
    tooltipWidget = document.createElement("div");

    jest
      .spyOn(aceSession, "documentToScreenPosition")
      .mockImplementation((docRow, docCol) => ({
        row: docRow,
        column: docCol,
      }));

    layerConfig = {
      characterWidth: 5,
      lineHeight: 12,
    };

    markerLayer = {
      $padding: 2,
      element: document.createElement("div"),
      $getTop(row: number): number {
        return row;
      },
    };
  });

  afterAll(() => {
    aceEditor.destroy();
    layerConfig = null;
    markerLayer = null;
  });

  describe("#update", () => {
    it("should update position of the marker in the DOM", () => {
      const position = {
        row: 1,
        column: 1,
      };
      const marker = new TooltipMarker(aceSession, position, tooltipWidget);
      marker.update([], markerLayer, aceSession, layerConfig);

      expect(tooltipWidget.style.top).toBe("14px");
      expect(tooltipWidget.style.left).toBe("7px");
    });
  });

  describe("#setPosition", () => {
    it("should update position of the marker in the Widget", () => {
      const initialPosition = {
        row: 1,
        column: 1,
      };
      const finalPosition = {
        row: 12,
        column: 3,
      };
      const marker = new TooltipMarker(
        aceSession,
        initialPosition,
        tooltipWidget,
      );

      aceSession.on("changeFrontMarker", () => {
        marker.update([], markerLayer, aceSession, layerConfig);
      });

      marker.setPosition(finalPosition);
      expect(tooltipWidget.style.opacity).toBe("1");
      expect(tooltipWidget.style.top).toBe("25px");
      expect(tooltipWidget.style.left).toBe("17px");
    });
  });
});
