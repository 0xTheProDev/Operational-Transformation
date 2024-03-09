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
import { v4 as uuid } from "uuid";
import { IFireAceEditor } from "@otjs/firebase-ace";

/**
 * Augment Global Namespace to enable Cache and Hot Module Replacement logic.
 */
declare global {
  interface Window {
    aceEditor?: AceAjax.Editor;
    fireAce?: IFireAceEditor;
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
window.aceEditor = undefined;
window.fireAce = undefined;

/**
 * Generate Random Integer
 */
const randInt = (limit: number = 1) => (Math.random() * limit) | 0;

/** User Color */
const userColor = `rgb(${randInt(255)}, ${randInt(255)}, ${randInt(255)})`;

/** User Id */
const userId = uuid();

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
const getEditorInstance = (): AceAjax.Editor => {
  if (window.aceEditor) {
    return window.aceEditor;
  }

  const editor = ace.edit("editor");
  editor.setReadOnly(true);
  editor.setTheme("ace/theme/textmate");

  const session = editor.getSession();
  session.setUseWrapMode(true);
  session.setUseWorker(false);
  session.setMode("ace/mode/javascript");

  window.addEventListener("resize", () => {
    editor.resize(true);
  });

  window.aceEditor = editor;
  return editor;
};

/**
 * Handle Creation of Collaborative Editor.
 */
const onDocumentReady = (): void => {
  const editor = getEditorInstance();

  if (window.fireAce) {
    console.log("Changes detected, recreating editor.");
    editor.setReadOnly(true);
    window.fireAce.dispose();
  }

  const { FireAceEditor } = require("@otjs/firebase-ace");
  const databaseRef = getDatabaseRef();

  const fireAce = new FireAceEditor({
    announcementDuration: Infinity,
    databaseRef,
    editor,
    userId,
    userColor,
    userName,
  });

  fireAce.on("ready", () => {
    editor.setReadOnly(false);
  });

  window.fireAce = fireAce;
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
  module.hot.accept("@otjs/firebase-ace", onDocumentReady);
}

export {};
