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

import { initializeApp } from "firebase/app";
import {
  DatabaseReference,
  child,
  getDatabase,
  push,
  ref,
} from "firebase/database";
import * as monaco from "monaco-editor";
import { v4 as uuid } from "uuid";
import { IFireMonacoEditor } from "@otjs/fb-monaco";

/**
 * Augment Global Namespace to enable Cache and Hot Module Replacement logic.
 */
declare global {
  interface Window {
    editor?: monaco.editor.IStandaloneCodeEditor;
    fireMonaco?: IFireMonacoEditor;
  }
  interface NodeModule {
    hot?: {
      accept(path: string, callback: Function): void;
    };
  }
}

/**
 * Cleanup
 */
window.editor = undefined;
window.fireMonaco = undefined;

/** User Color */
const userColor = `rgb(${(Math.random() * 255) | 0}, ${
  (Math.random() * 255) | 0
}, ${(Math.random() * 255) | 0})`;

/** User Id */
const userId = uuid();

/** User Name */
const userName = `Anonymous ${(Math.random() * 100) | 0}`;

/**
 * @returns Unique Data Reference in the Database.
 */
const getDatabaseRef = (): DatabaseReference => {
  let _ref: DatabaseReference = ref(getDatabase());

  const hash = window.location.hash.replace(/#/g, "");

  if (hash) {
    _ref = child(_ref, hash);
  } else {
    _ref = push(_ref); // generate unique location.
    window.location.replace(window.location + "#" + _ref.key); // add it as a hash to the URL.
  }

  console.log("Firebase Database URL: ", _ref.toString());
  return _ref;
};

/**
 * @returns - Monaco Editor instance.
 */
const getEditorInstance = (): monaco.editor.IStandaloneCodeEditor => {
  if (window.editor) {
    return window.editor;
  }

  const editor = monaco.editor.create(document.getElementById("editor")!, {
    language: "plaintext",
    fontSize: 18,
    readOnly: true,
    theme: "vs-dark",
    trimAutoWhitespace: false,
  });

  window.addEventListener("resize", () => {
    editor.layout();
  });

  window.editor = editor;
  return editor;
};

/**
 * Handle Creation of Collaborative Editor.
 */
const onDocumentReady = (): void => {
  const editor = getEditorInstance();

  if (window.fireMonaco) {
    console.log("Changes detected, recreating editor.");
    editor.updateOptions({ readOnly: true });
    window.fireMonaco.dispose();
  }

  const { FireMonacoEditor } = require("@otjs/fb-monaco");
  const databaseRef = getDatabaseRef();

  window.fireMonaco = new FireMonacoEditor({
    editor,
    databaseRef,
    userId,
    userColor,
    userName,
  });

  editor.updateOptions({ readOnly: false });
};

/**
 * Initialize Firebase App.
 */
initializeApp(process.env.FIREBASE_CONFIG as Object);

/**
 * Register timer for main app.
 */
setTimeout(onDocumentReady, 1);

/**
 * Handle module.hot replacement.
 */
if (module.hot) {
  module.hot.accept("@otjs/fb-monaco", onDocumentReady);
}
