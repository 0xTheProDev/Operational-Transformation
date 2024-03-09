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

import * as monaco from "monaco-editor";
import { assert } from "@otjs/utils";

assert(jest != null, "This factories can only be imported in Test environment");

/**
 * Mock Function to replace `dispose` functionality of Editor Adapter.
 */
export const dispose = jest.fn<void, []>();

/**
 * Mock Function to replace `getText` functionality of Editor Adapter.
 */
export const getText = jest.fn<string, []>();

/**
 * Mock Function to replace `setText` functionality of Editor Adapter.
 */
export const setText = jest.fn<void, [string]>();

/**
 * Mock Function to replace `constructor` functionality of Editor Adapter.
 */
export const monacoAdapterCtor = jest.fn<
  MonacoAdapter,
  [monaco.editor.IStandaloneCodeEditor]
>();

/**
 * Mock Class to replace functionality of Editor Adapter.
 */
export class MonacoAdapter {
  constructor({ editor }: { editor: monaco.editor.IStandaloneCodeEditor }) {
    monacoAdapterCtor(editor);
  }

  dispose(): void {
    dispose();
  }

  getText(): string {
    return getText();
  }

  setText(text: string): void {
    setText(text);
  }
}
