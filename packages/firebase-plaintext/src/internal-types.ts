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
import { IPlainTextOperation, TPlainTextOperation } from "@otjs/plaintext";
import { TCursor } from "@otjs/plaintext-editor";

/**
 * @internal
 * Serialized Revision Data.
 */
export type TRevision = {
  /** Author */
  a: string;
  /** Operation */
  o: TPlainTextOperation;
};

/**
 * @internal
 * Map of Revision Id to Serialized Revision Data.
 */
export type TRevisionHistory = {
  [revisionId: string]: TRevision;
};

/**
 * @internal
 * Serialized Operation Data to Send across clients.
 */
export type TOperationData = TRevision & {
  /** Timestamp */
  t: unknown;
};

/**
 * @internal
 * Serialized Cursor Data to Send across clients.
 */
export type TCursorData = {
  /** Color of Cursor */
  color: string;
  /** Name of User */
  name: string;
  /** Position of Cursor/Selection */
  cursor: TCursor;
};

/**
 * @internal
 * Copy of the Operation and Revision Id just sent.
 */
export type TSentOperation = {
  /** Revision Id */
  id: string;
  /** Operation Sent to Server */
  op: IPlainTextOperation;
};

/**
 * @internal
 * Parsed Operation data from JSON representation.
 */
export type TParsedRevision = {
  /** Author */
  author: string;
  /** Operation */
  operation: IPlainTextOperation;
};

/**
 * @internal
 * Mark Check Point in Firebase.
 */
export type TCheckPointData = {
  /** Author */
  a: string;
  /** Operation */
  o: TPlainTextOperation;
  /** Check Point Id */
  id: string;
};
