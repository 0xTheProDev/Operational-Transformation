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
import { PresenceChannel } from "pusher-js";
import { PusherAdapter } from "@otjs/pusher-plaintext";
import { MonacoAdapter } from "@otjs/monaco";
import {
  pusherAdapterCtor,
  isHistoryEmpty,
  setUserColor,
  setUserId,
  setUserName,
  dispose as dbDispose,
} from "../__mocks__/pusher-adapter.mock";
import {
  monacoAdapterCtor,
  getText,
  setText,
  dispose as editorDispose,
} from "../__mocks__/monaco-adapter.mock";
import {
  editorClientCtor,
  clearUndoRedoStack,
  on as clientOn,
  off as clientOff,
  dispose as clientDispose,
} from "../__mocks__/editor-client.mock";
import { PusherMonacoEditor } from "../src/pusher-monaco.impl";

describe("Test PusherMonaco Editor", () => {
  let channel: PresenceChannel,
    editor: monaco.editor.IStandaloneCodeEditor,
    pusherMonaco: PusherMonacoEditor;

  const userColor = "#08c",
    userId = "user2",
    userName = "Rob";

  beforeAll(() => {
    channel = Object.create(null);
    editor = Object.create(null);
  });

  beforeEach(() => {
    pusherMonaco = new PusherMonacoEditor({
      channel,
      editor,
      userColor,
      userId,
      userName,
    });
  });

  afterEach(() => {
    pusherMonaco.dispose();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should create a Firebase Adapter from the Database Reference", () => {
    expect(pusherAdapterCtor).toHaveBeenCalledWith(channel);
  });

  it("should create a Monaco Adapter from the Editor instance", () => {
    expect(monacoAdapterCtor).toHaveBeenCalledWith(editor);
  });

  it("should create an Editor Client from Firebase and Monaco Adapters", () => {
    expect(editorClientCtor).toHaveBeenCalledWith(
      expect.any(PusherAdapter),
      expect.any(MonacoAdapter)
    );
  });

  describe("@disposed", () => {
    it("should return true if the editor has been disposed", () => {
      pusherMonaco.dispose();
      expect(pusherMonaco.disposed).toBe(true);
    });

    it("should return false if the editor not yet disposed", () => {
      expect(pusherMonaco.disposed).toBe(false);
    });
  });

  describe("@text", () => {
    it("should return current content from editor", () => {
      const _ = pusherMonaco.text;
      expect(getText).toHaveBeenCalled();
    });

    it("should set content to editor", () => {
      const text = "Some Content";
      pusherMonaco.text = text;
      expect(setText).toHaveBeenCalledWith(text);
    });

    it("should return empty string if editor is already disposed", () => {
      pusherMonaco.dispose();
      expect(pusherMonaco.text).toBe("");
    });

    it("should not throw error if editor is already disposed", () => {
      pusherMonaco.dispose();
      expect(() => (pusherMonaco.text = "test")).not.toThrow();
    });
  });

  describe("@userColor", () => {
    it("should return current user color", () => {
      expect(pusherMonaco.userColor).toBe(userColor);
    });

    it("should set user color to database", () => {
      const color = "#eef";
      pusherMonaco.userColor = color;
      expect(setUserColor).toHaveBeenCalledWith(color);
    });

    it("should not throw error if database connection is already disposed", () => {
      pusherMonaco.dispose();
      expect(() => (pusherMonaco.userColor = "#fff")).not.toThrow();
    });
  });

  describe("@userId", () => {
    it("should return current user Id", () => {
      expect(pusherMonaco.userId).toBe(userId);
    });

    it("should set user Id to database", () => {
      const user = "user3";
      pusherMonaco.userId = user;
      expect(setUserId).toHaveBeenCalledWith(user);
    });

    it("should not throw error if database connection is already disposed", () => {
      pusherMonaco.dispose();
      expect(() => (pusherMonaco.userId = "user")).not.toThrow();
    });
  });

  describe("@userName", () => {
    it("should return current user name", () => {
      expect(pusherMonaco.userName).toBe(userName);
    });

    it("should set user name to database", () => {
      const name = "Van";
      pusherMonaco.userName = name;
      expect(setUserName).toHaveBeenCalledWith(name);
    });

    it("should return user Id if user name is not given", () => {
      const temp = new PusherMonacoEditor({
        channel,
        editor,
        userColor,
        userId,
      });
      expect(temp.userName).toBe(userId);
    });

    it("should not throw error if database connection is already disposed", () => {
      pusherMonaco.dispose();
      expect(() => (pusherMonaco.userName = "Sam")).not.toThrow();
    });
  });

  describe("#clearHistory", () => {
    it("should clear Undo/Redo stack of editor client", () => {
      pusherMonaco.clearHistory();
      expect(clearUndoRedoStack).toHaveBeenCalled();
    });
  });

  describe("#dispose", () => {
    it("should dispose editor instance", () => {
      pusherMonaco.dispose();
      expect(editorDispose).toHaveBeenCalled();
    });

    it("should dispose database connection", () => {
      pusherMonaco.dispose();
      expect(dbDispose).toHaveBeenCalled();
    });

    it("should dispose editor client", () => {
      pusherMonaco.dispose();
      expect(clientDispose).toHaveBeenCalled();
    });

    it("should not throw error if already disposed", () => {
      pusherMonaco.dispose();
      expect(() => pusherMonaco.dispose()).not.toThrow();
    });
  });

  describe("#isHistoryEmpty", () => {
    it("should check if database is empty", () => {
      pusherMonaco.isHistoryEmpty();
      expect(isHistoryEmpty).toHaveBeenCalled();
    });
  });

  describe("#on", () => {
    it("should add event listener to editor client", () => {
      const handler = () => {};
      // @ts-expect-error
      pusherMonaco.on("ready", handler);
      expect(clientOn).toHaveBeenCalledWith("ready", handler);
    });
  });

  describe("#off", () => {
    it("should remove event listener from editor client", () => {
      const handler = () => {};
      // @ts-expect-error
      pusherMonaco.off("ready", handler);
      expect(clientOff).toHaveBeenCalledWith("ready", handler);
    });
  });
});
