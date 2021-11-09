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

import { Options } from "pusher";
import Pusher, { PresenceChannel, Options as ClientOptions } from "pusher-js";
import * as monaco from "monaco-editor";
import { v4 as uuid } from "uuid";
import { IPusherMonacoEditor } from "@otjs/pusher-monaco";

/**
 * Augment Global Namespace to enable Cache and Hot Module Replacement logic.
 */
declare global {
  interface Window {
    monacoEditor?: monaco.editor.IStandaloneCodeEditor;
    pusherMonaco?: IPusherMonacoEditor;
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
window.monacoEditor = undefined;
window.pusherMonaco = undefined;

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

/** Pusher Core Instance */
const pusherConfig = process.env.PUSHER_CONFIG as unknown as Options;
const pusher = new Pusher(pusherConfig.key, pusherConfig as ClientOptions);
let unsubscribe = () => {};

/**
 * @returns Unique Presence Channel in Pusher.
 */
const getPresenceChannel = (): PresenceChannel => {
  let channel: string = "presence-";
  const hash = window.location.hash.replace(/#/g, "");

  if (hash) {
    channel += hash;
  } else {
    const channelId = uuid().split("-").pop(); // generate unique location.
    window.location.replace(window.location + "#" + channelId); // add it as a hash to the URL.
    channel += channelId;
  }

  console.log("Pusher Channel ID: ", channel);

  unsubscribe = () => {
    pusher.unsubscribe(channel);
  };

  return pusher.subscribe(channel) as PresenceChannel;
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

  if (window.pusherMonaco) {
    console.log("Changes detected, recreating editor.");
    editor.updateOptions({ readOnly: true });
    window.pusherMonaco.dispose();
    unsubscribe();
  }

  const { PusherMonacoEditor } = require("@otjs/pusher-monaco");
  const channel = getPresenceChannel();

  // channel.bind("pusher:subscription_succeeded", () => {
  const pusherMonaco = new PusherMonacoEditor({
    announcementDuration: Infinity,
    channel,
    editor,
    userId,
    userColor,
    userName,
  });

  pusherMonaco.on("ready", () => {
    editor.updateOptions({ readOnly: false });
  });

  window.pusherMonaco = pusherMonaco;
  // });
};

/**
 * Register timer for main app.
 */
setTimeout(onDocumentReady, 1);

/**
 * Handle module.hot replacement.
 */
if (module.hot) {
  module.hot.accept("@otjs/pusher-monaco", onDocumentReady);
}

export {};
