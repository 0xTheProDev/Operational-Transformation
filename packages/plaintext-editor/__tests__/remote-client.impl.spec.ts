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

import { Cursor } from "../src/cursor.impl";
import { IEditorAdapter } from "../src/editor-adapter";
import { IRemoteClient } from "../src/remote-client";
import { RemoteClient } from "../src/remote-client.impl";
import { getEditorAdapter, IMockEditorAdapter } from "../__mocks__";

describe("Remote Client", () => {
  let clientId: string;
  let remoteClient: IRemoteClient;
  let editorAdapter: IMockEditorAdapter;

  beforeAll(() => {
    clientId = Math.round(Math.random() * 100).toString();
    editorAdapter = getEditorAdapter();

    remoteClient = new RemoteClient(clientId, editorAdapter as IEditorAdapter);
  });

  describe("#setColor", () => {
    it("should set cursor/selection color for remote user", () => {
      const fn = () => remoteClient.setColor("#fff");
      expect(fn).not.toThrow();
    });
  });

  describe("#setUserName", () => {
    it("should set name/short-name for remote user", () => {
      const fn = () => remoteClient.setUserName("Robin");
      expect(fn).not.toThrow();
    });
  });

  describe("#updateCursor", () => {
    it("should update cursor/selection position for remote user", () => {
      const userCursor = new Cursor(5, 8);
      remoteClient.updateCursor(userCursor);
      expect(editorAdapter.setOtherCursor).toHaveBeenCalledWith({
        clientId,
        cursor: userCursor,
        userColor: "#fff",
        userName: "Robin",
      });
    });
  });

  describe("#removeCursor", () => {
    it("should remove cursor/selection for remote user", () => {
      remoteClient.removeCursor();
      expect(editorAdapter.disposeCursor).toHaveBeenCalled();
    });
  });
});
