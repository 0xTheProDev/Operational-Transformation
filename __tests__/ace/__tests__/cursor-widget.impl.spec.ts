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
  createCursorWidget,
  disposeCursorWidgets,
} from "@otjs/ace/src/cursor-widget.impl";
import { TooltipMarker } from "@otjs/ace/src/tooltip-marker";

/**
 * Range Constructor for Ace Editor
 */
const Range: typeof AceAjax.Range = ace.require("ace/range").Range;

describe("Test Cursor Widget", () => {
  let aceEditor: AceAjax.Editor,
    aceSession: AceAjax.IEditSession,
    addDynamicMarker: jest.SpyInstance<
      void,
      [widget: TooltipMarker, inFront: boolean]
    >,
    removeMarker: jest.SpyInstance<void, [widgetId: number]>,
    signal: jest.SpyInstance<void, [event: string]>;

  beforeAll(() => {
    const containerEl = document.createElement("div");
    document.body.appendChild(containerEl);
    aceEditor = ace.edit(containerEl);
    aceSession = aceEditor.getSession();
    addDynamicMarker = jest.spyOn(aceSession, "addDynamicMarker");
    removeMarker = jest.spyOn(aceSession, "removeMarker");
    // @ts-expect-error
    signal = jest.spyOn(aceSession, "_signal");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("Test createCursorWidget", () => {
    it("should create Content Widget for Cursor name", (done: jest.DoneCallback) => {
      createCursorWidget({
        clientId: "userName",
        className: "remote-client-000",
        duration: Infinity,
        editor: aceEditor,
        range: new Range(1, 1, 1, 3),
      });
      setTimeout(() => {
        expect(addDynamicMarker).toHaveBeenCalled();
        done();
      }, 1);
    });

    it("should update Content Widget if Range changes", () => {
      createCursorWidget({
        clientId: "userName",
        className: "remote-client-000",
        duration: Infinity,
        editor: aceEditor,
        range: new Range(9, 2, 9, 3),
      });
      expect(signal).toHaveBeenCalledWith("changeFrontMarker");
    });

    it("should update Content Widget if User Name changes", () => {
      createCursorWidget({
        clientId: "userName",
        className: "remote-client-000",
        duration: Infinity,
        editor: aceEditor,
        range: new Range(9, 2, 9, 3),
        userName: "userName2",
      });
      expect(signal).toHaveBeenCalledWith("changeFrontMarker");
    });
  });

  describe("Test disposeCursorWidgets", () => {
    it("should clean up all Cursor Widgets", () => {
      disposeCursorWidgets().dispose();
      expect(removeMarker).toHaveBeenCalled();
    });
  });
});
