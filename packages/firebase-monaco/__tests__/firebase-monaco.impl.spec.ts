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
import { DatabaseReference } from "firebase/database";
import { FirebaseAdapter } from "@otjs/firebase-plaintext";
import { MonacoAdapter } from "@otjs/monaco";
import {
  firebaseAdapterCtor,
  isHistoryEmpty,
  setUserColor,
  setUserId,
  setUserName,
  dispose as dbDispose,
} from "../__mocks__/firebase-adapter.mock";
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
import { FireMonacoEditor } from "../src/firebase-monaco.impl";

describe("Test FireMonaco Editor", () => {
  let editor: monaco.editor.IStandaloneCodeEditor,
    fireMonaco: FireMonacoEditor,
    databaseRef: DatabaseReference;

  const userColor = "#08c",
    userId = "user2",
    userName = "Rob";

  beforeAll(() => {
    editor = Object.create(null);
    databaseRef = Object.create(null);
  });

  beforeEach(() => {
    fireMonaco = new FireMonacoEditor({
      databaseRef,
      editor,
      userColor,
      userId,
      userName,
    });
  });

  afterEach(() => {
    fireMonaco.dispose();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should create a Firebase Adapter from the Database Reference", () => {
    expect(firebaseAdapterCtor).toHaveBeenCalledWith(databaseRef);
  });

  it("should create a Monaco Adapter from the Editor instance", () => {
    expect(monacoAdapterCtor).toHaveBeenCalledWith(editor);
  });

  it("should create an Editor Client from Firebase and Monaco Adapters", () => {
    expect(editorClientCtor).toHaveBeenCalledWith(
      expect.any(FirebaseAdapter),
      expect.any(MonacoAdapter),
    );
  });

  describe("@disposed", () => {
    it("should return true if the editor has been disposed", () => {
      fireMonaco.dispose();
      expect(fireMonaco.disposed).toBe(true);
    });

    it("should return false if the editor not yet disposed", () => {
      expect(fireMonaco.disposed).toBe(false);
    });
  });

  describe("@text", () => {
    it("should return current content from editor", () => {
      const _ = fireMonaco.text;
      expect(getText).toHaveBeenCalled();
    });

    it("should set content to editor", () => {
      const text = "Some Content";
      fireMonaco.text = text;
      expect(setText).toHaveBeenCalledWith(text);
    });

    it("should return empty string if editor is already disposed", () => {
      fireMonaco.dispose();
      expect(fireMonaco.text).toBe("");
    });

    it("should not throw error if editor is already disposed", () => {
      fireMonaco.dispose();
      expect(() => (fireMonaco.text = "test")).not.toThrow();
    });
  });

  describe("@userColor", () => {
    it("should return current user color", () => {
      expect(fireMonaco.userColor).toBe(userColor);
    });

    it("should set user color to database", () => {
      const color = "#eef";
      fireMonaco.userColor = color;
      expect(setUserColor).toHaveBeenCalledWith(color);
    });

    it("should not throw error if database connection is already disposed", () => {
      fireMonaco.dispose();
      expect(() => (fireMonaco.userColor = "#fff")).not.toThrow();
    });
  });

  describe("@userId", () => {
    it("should return current user Id", () => {
      expect(fireMonaco.userId).toBe(userId);
    });

    it("should set user Id to database", () => {
      const user = "user3";
      fireMonaco.userId = user;
      expect(setUserId).toHaveBeenCalledWith(user);
    });

    it("should not throw error if database connection is already disposed", () => {
      fireMonaco.dispose();
      expect(() => (fireMonaco.userId = "user")).not.toThrow();
    });
  });

  describe("@userName", () => {
    it("should return current user name", () => {
      expect(fireMonaco.userName).toBe(userName);
    });

    it("should set user name to database", () => {
      const name = "Van";
      fireMonaco.userName = name;
      expect(setUserName).toHaveBeenCalledWith(name);
    });

    it("should return user Id if user name is not given", () => {
      const temp = new FireMonacoEditor({
        databaseRef,
        editor,
        userColor,
        userId,
      });
      expect(temp.userName).toBe(userId);
    });

    it("should not throw error if database connection is already disposed", () => {
      fireMonaco.dispose();
      expect(() => (fireMonaco.userName = "Sam")).not.toThrow();
    });
  });

  describe("#clearHistory", () => {
    it("should clear Undo/Redo stack of editor client", () => {
      fireMonaco.clearHistory();
      expect(clearUndoRedoStack).toHaveBeenCalled();
    });
  });

  describe("#dispose", () => {
    it("should dispose editor instance", () => {
      fireMonaco.dispose();
      expect(editorDispose).toHaveBeenCalled();
    });

    it("should dispose database connection", () => {
      fireMonaco.dispose();
      expect(dbDispose).toHaveBeenCalled();
    });

    it("should dispose editor client", () => {
      fireMonaco.dispose();
      expect(clientDispose).toHaveBeenCalled();
    });

    it("should not throw error if already disposed", () => {
      fireMonaco.dispose();
      expect(() => fireMonaco.dispose()).not.toThrow();
    });
  });

  describe("#isHistoryEmpty", () => {
    it("should check if database is empty", () => {
      fireMonaco.isHistoryEmpty();
      expect(isHistoryEmpty).toHaveBeenCalled();
    });
  });

  describe("#on", () => {
    it("should add event listener to editor client", () => {
      const handler = () => {};
      // @ts-expect-error
      fireMonaco.on("ready", handler);
      expect(clientOn).toHaveBeenCalledWith("ready", handler);
    });
  });

  describe("#off", () => {
    it("should remove event listener from editor client", () => {
      const handler = () => {};
      // @ts-expect-error
      fireMonaco.off("ready", handler);
      expect(clientOff).toHaveBeenCalledWith("ready", handler);
    });
  });
});
