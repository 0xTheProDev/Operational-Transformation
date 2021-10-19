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

import { TCursor } from "@otjs/plaintext-editor";
import { TPlainTextOperation } from "@otjs/plaintext";

/** Additional Metadata on a Member */
export type TMemberInfo = {
  /** Color of user's Cursor/Selection */
  color: string;
  /** Position of user's Cursor/Selection */
  cursor: TCursor | null;
  /** User Name */
  name: string;
};

/** Type Definition for a Member */
export type TMember = {
  /** User Id */
  id: string;
  /** Additional Metadata on a member */
  info: TMemberInfo;
};

/** Error Payload on Subscription Error */
export type TSubscriptionError = {
  /** Category of error that occured, e.g. AuthError */
  type: string;
  /** Human readable details of error that occurred. */
  error: string;
  /** The HTTP Status code of the error response from the authentication call. */
  status: number;
};

/**
 * JSON Representation of Plain Text Operation in Pusher
 */
export type TOperationData = {
  author: string;
  operation: TPlainTextOperation;
  timestamp: number;
};
