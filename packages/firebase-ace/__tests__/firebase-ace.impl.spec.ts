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

import { DatabaseReference } from "firebase/database";
import { AceAdapter } from "@otjs/ace";
import { FirebaseAdapter } from "@otjs/firebase-plaintext";
import {
  monacoAdapterCtor,
  getText,
  setText,
  dispose as editorDispose,
} from "../__mocks__/ace-adapter.mock";
import {
  firebaseAdapterCtor,
  isHistoryEmpty,
  setUserColor,
  setUserId,
  setUserName,
  dispose as dbDispose,
} from "../__mocks__/firebase-adapter.mock";
import {
  editorClientCtor,
  clearUndoRedoStack,
  on as clientOn,
  off as clientOff,
  dispose as clientDispose,
} from "../__mocks__/editor-client.mock";
import { FireAceEditor } from "../src/firebase-ace.impl";

describe("Test FireAce Editor", () => {
  let editor: AceAjax.Editor,
    fireAce: FireAceEditor,
    databaseRef: DatabaseReference;

  const userColor = "#08c",
    userId = "user2",
    userName = "Rob";

  beforeAll(() => {
    editor = Object.create(null);
    databaseRef = Object.create(null);
  });

  beforeEach(() => {
    fireAce = new FireAceEditor({
      databaseRef,
      editor,
      userColor,
      userId,
      userName,
    });
  });

  afterEach(() => {
    fireAce.dispose();
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
      expect.any(AceAdapter)
    );
  });

  describe("@disposed", () => {
    it("should return true if the editor has been disposed", () => {
      fireAce.dispose();
      expect(fireAce.disposed).toBe(true);
    });

    it("should return false if the editor not yet disposed", () => {
      expect(fireAce.disposed).toBe(false);
    });
  });

  describe("@text", () => {
    it("should return current content from editor", () => {
      const _ = fireAce.text;
      expect(getText).toHaveBeenCalled();
    });

    it("should set content to editor", () => {
      const text = "Some Content";
      fireAce.text = text;
      expect(setText).toHaveBeenCalledWith(text);
    });

    it("should return empty string if editor is already disposed", () => {
      fireAce.dispose();
      expect(fireAce.text).toBe("");
    });

    it("should not throw error if editor is already disposed", () => {
      fireAce.dispose();
      expect(() => (fireAce.text = "test")).not.toThrow();
    });
  });

  describe("@userColor", () => {
    it("should return current user color", () => {
      expect(fireAce.userColor).toBe(userColor);
    });

    it("should set user color to database", () => {
      const color = "#eef";
      fireAce.userColor = color;
      expect(setUserColor).toHaveBeenCalledWith(color);
    });

    it("should not throw error if database connection is already disposed", () => {
      fireAce.dispose();
      expect(() => (fireAce.userColor = "#fff")).not.toThrow();
    });
  });

  describe("@userId", () => {
    it("should return current user Id", () => {
      expect(fireAce.userId).toBe(userId);
    });

    it("should set user Id to database", () => {
      const user = "user3";
      fireAce.userId = user;
      expect(setUserId).toHaveBeenCalledWith(user);
    });

    it("should not throw error if database connection is already disposed", () => {
      fireAce.dispose();
      expect(() => (fireAce.userId = "user")).not.toThrow();
    });
  });

  describe("@userName", () => {
    it("should return current user name", () => {
      expect(fireAce.userName).toBe(userName);
    });

    it("should set user name to database", () => {
      const name = "Van";
      fireAce.userName = name;
      expect(setUserName).toHaveBeenCalledWith(name);
    });

    it("should return user Id if user name is not given", () => {
      const temp = new FireAceEditor({
        databaseRef,
        editor,
        userColor,
        userId,
      });
      expect(temp.userName).toBe(userId);
    });

    it("should not throw error if database connection is already disposed", () => {
      fireAce.dispose();
      expect(() => (fireAce.userName = "Sam")).not.toThrow();
    });
  });

  describe("#clearHistory", () => {
    it("should clear Undo/Redo stack of editor client", () => {
      fireAce.clearHistory();
      expect(clearUndoRedoStack).toHaveBeenCalled();
    });
  });

  describe("#dispose", () => {
    it("should dispose editor instance", () => {
      fireAce.dispose();
      expect(editorDispose).toHaveBeenCalled();
    });

    it("should dispose database connection", () => {
      fireAce.dispose();
      expect(dbDispose).toHaveBeenCalled();
    });

    it("should dispose editor client", () => {
      fireAce.dispose();
      expect(clientDispose).toHaveBeenCalled();
    });

    it("should not throw error if already disposed", () => {
      fireAce.dispose();
      expect(() => fireAce.dispose()).not.toThrow();
    });
  });

  describe("#isHistoryEmpty", () => {
    it("should check if database is empty", () => {
      fireAce.isHistoryEmpty();
      expect(isHistoryEmpty).toHaveBeenCalled();
    });
  });

  describe("#on", () => {
    it("should add event listener to editor client", () => {
      const handler = () => {};
      // @ts-expect-error
      fireAce.on("ready", handler);
      expect(clientOn).toHaveBeenCalledWith("ready", handler);
    });
  });

  describe("#off", () => {
    it("should remove event listener from editor client", () => {
      const handler = () => {};
      // @ts-expect-error
      fireAce.off("ready", handler);
      expect(clientOff).toHaveBeenCalledWith("ready", handler);
    });
  });
});
