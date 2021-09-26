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

import * as monaco from "monaco-editor";
import {
  createCursorWidget,
  disposeCursorWidgets,
} from "@otjs/monaco/src/cursor-widget.impl";

jest.setTimeout(10000 /** 10 seconds */);

describe("Test Cursor Widget", () => {
  let monacoEditor: monaco.editor.IStandaloneCodeEditor,
    addContentWidget: jest.SpyInstance<
      void,
      [widget: monaco.editor.IContentWidget]
    >,
    layoutContentWidget: jest.SpyInstance<
      void,
      [widget: monaco.editor.IContentWidget]
    >,
    removeContentWidget: jest.SpyInstance<
      void,
      [widget: monaco.editor.IContentWidget]
    >;

  beforeAll(() => {
    const containerEl = document.createElement("div");
    document.body.appendChild(containerEl);
    monacoEditor = monaco.editor.create(containerEl);

    addContentWidget = jest.spyOn(monacoEditor, "addContentWidget");
    layoutContentWidget = jest.spyOn(monacoEditor, "layoutContentWidget");
    removeContentWidget = jest.spyOn(monacoEditor, "removeContentWidget");
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
        editor: monacoEditor,
        range: new monaco.Range(1, 1, 1, 3),
      });
      setTimeout(() => {
        expect(addContentWidget).toHaveBeenCalled();
        done();
      }, 1);
    });

    it("should update Content Widget if Range changes", () => {
      createCursorWidget({
        clientId: "userName",
        className: "remote-client-000",
        duration: Infinity,
        editor: monacoEditor,
        range: new monaco.Range(9, 2, 9, 3),
      });
      expect(layoutContentWidget).toHaveBeenCalled();
    });

    it("should not update Content Widget if Range is same as before", () => {
      createCursorWidget({
        clientId: "userName",
        className: "remote-client-000",
        duration: Infinity,
        editor: monacoEditor,
        range: new monaco.Range(9, 2, 9, 3),
      });
      expect(layoutContentWidget).not.toHaveBeenCalled();
    });
  });

  describe("Test disposeCursorWidgets", () => {
    it("should clean up all Cursor Widgets", () => {
      disposeCursorWidgets().dispose();
      expect(removeContentWidget).toHaveBeenCalled();
    });
  });
});
