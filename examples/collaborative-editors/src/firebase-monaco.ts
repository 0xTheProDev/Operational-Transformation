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

import { initializeApp } from "firebase/app";
import {
  DatabaseReference,
  child,
  getDatabase,
  push,
  ref,
} from "firebase/database";
import * as monaco from "monaco-editor";
import { IFireMonacoEditor } from "@otjs/firebase-monaco";

/**
 * Augment Global Namespace to enable Cache and Hot Module Replacement logic.
 */
declare global {
  interface Window {
    monacoEditor?: monaco.editor.IStandaloneCodeEditor;
    fireMonaco?: IFireMonacoEditor;
  }
}

/**
 * Cleanup
 */
window.monacoEditor = undefined;
window.fireMonaco = undefined;

/**
 * Generate Random Integer
 */
const randInt = (limit: number = 1) => (Math.random() * limit) | 0;

/** User Color */
const userColor = `rgb(${randInt(255)}, ${randInt(255)}, ${randInt(255)})`;

/** User Id */
const userId = crypto.randomUUID();

/** User Name */
const userName = `Anonymous ${randInt(100)}`;

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
  if (window.monacoEditor) {
    return window.monacoEditor;
  }

  const editor = monaco.editor.create(document.getElementById("editor")!, {
    fontSize: 18,
    language: "plaintext",
    minimap: {
      enabled: false,
    },
    readOnly: true,
    theme: "vs-dark",
    trimAutoWhitespace: false,
  });

  window.addEventListener("resize", () => {
    editor.layout();
  });

  window.monacoEditor = editor;
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

  const { FireMonacoEditor } = require("@otjs/firebase-monaco");
  const databaseRef = getDatabaseRef();

  const fireMonaco = new FireMonacoEditor({
    announcementDuration: Infinity,
    databaseRef,
    editor,
    userId,
    userColor,
    userName,
  });

  fireMonaco.on("ready", () => {
    editor.updateOptions({ readOnly: false });
  });

  window.fireMonaco = fireMonaco;
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
  module.hot.accept("@otjs/firebase-monaco", onDocumentReady);
}

export {};
