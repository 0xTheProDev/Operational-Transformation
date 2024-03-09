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

import { DatabaseReference } from "firebase/database";
import { assert } from "@otjs/utils";

assert(jest != null, "This factories can only be imported in Test environment");

/**
 * Mock Function to replace `dispose` functionality of Database Adapter.
 */
export const dispose = jest.fn<void, []>();

/**
 * Mock Function to replace `setUserColor` functionality of Database Adapter.
 */
export const isHistoryEmpty = jest.fn<boolean, []>();

/**
 * Mock Function to replace `setUserColor` functionality of Database Adapter.
 */
export const setUserColor = jest.fn<void, [string]>();

/**
 * Mock Function to replace `setUserId` functionality of Database Adapter.
 */
export const setUserId = jest.fn<void, [string]>();

/**
 * Mock Function to replace `setUserName` functionality of Database Adapter.
 */
export const setUserName = jest.fn<void, [string]>();

/**
 * Mock Function to replace `constructor` functionality of Database Adapter.
 */
export const firebaseAdapterCtor = jest.fn<
  FirebaseAdapter,
  [DatabaseReference]
>();

/**
 * Mock Class to replace functionality of Database Adapter.
 */
export class FirebaseAdapter {
  constructor({ databaseRef }: { databaseRef: DatabaseReference }) {
    firebaseAdapterCtor(databaseRef);
  }

  dispose(): void {
    dispose();
  }

  isHistoryEmpty(): boolean {
    return isHistoryEmpty();
  }

  setUserColor(userColor: string): void {
    setUserColor(userColor);
  }

  setUserId(userId: string): void {
    setUserId(userId);
  }

  setUserName(userName: string): void {
    setUserName(userName);
  }
}
