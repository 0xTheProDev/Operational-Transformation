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

import mitt, { Emitter, Handler } from "mitt";
import { IPlainTextOperation } from "@otjs/plaintext";
import { assert } from "@otjs/utils";
import { ICursor } from "../src/cursor";
import {
  DatabaseAdapterEvent,
  IDatabaseAdapter,
  TDatabaseAdapterEventArgs,
} from "../src/database-adapter";
import { clearMock, resetMock } from "./test-utils";

assert(jest != null, "This factories can only be imported in Test environment");

type TDatabaseAdapterConfig = {
  userId: string;
  userName: string;
  userColor: string;
};

let databaseRef: string;
let user: TDatabaseAdapterConfig;

const emitter: Emitter<TDatabaseAdapterEventArgs> = mitt();

export interface IMockDatabaseAdapter extends IDatabaseAdapter {
  /** Trigger an event with optional payload. */
  emit<Key extends keyof TDatabaseAdapterEventArgs>(
    event: Key,
    payload?: TDatabaseAdapterEventArgs[Key],
  ): void;
  /** Get current User object attached to the adapter */
  getUser(): TDatabaseAdapterConfig;
  /** Get Database Reference attached to the adapter */
  getDatabaseRef(): string;
}

// @ts-expect-error
const databaseAdapter: IMockDatabaseAdapter = Object.freeze({
  isCurrentUser: jest.fn<boolean, []>(() => false),
  isHistoryEmpty: jest.fn<boolean, []>(() => true),
  on: jest.fn<
    void,
    [
      DatabaseAdapterEvent,
      Handler<TDatabaseAdapterEventArgs[DatabaseAdapterEvent]>,
    ]
  >((ev, handler) => {
    emitter.on(ev, handler);
  }),
  off: jest.fn<
    void,
    [
      DatabaseAdapterEvent,
      Handler<TDatabaseAdapterEventArgs[DatabaseAdapterEvent]>,
    ]
  >((ev, handler) => {
    emitter.off(ev, handler);
  }),
  emit: jest.fn<
    void,
    [DatabaseAdapterEvent, TDatabaseAdapterEventArgs[DatabaseAdapterEvent]]
  >((ev, payload) => {
    emitter.emit(ev, payload);
  }),
  dispose: jest.fn<void, []>(() => {
    emitter.all.clear();
  }),
  sendCursor: jest.fn<void, [ICursor]>(),
  sendOperation: jest.fn<void, [IPlainTextOperation]>(),
  setUserColor: jest.fn<void, [string]>((color) => {
    user.userColor = color;
  }),
  setUserId: jest.fn<void, [string]>((userId) => {
    user.userId = userId;
  }),
  setUserName: jest.fn<void, [string]>((name) => {
    user.userName = name;
  }),
  getUser: jest.fn<TDatabaseAdapterConfig, []>(() => user),
  getDatabaseRef: jest.fn<string, []>(() => databaseRef),
});

afterEach(() => {
  clearMock(databaseAdapter);
});

afterAll(() => {
  // @ts-expect-error
  emitter = null;
  // @ts-expect-error
  user = null;
  resetMock(databaseAdapter);
});

/**
 * Returns a mock implementation of IDatabaseAdapter interface.
 * Useful for testing Editor Client, Firepad and related helper functions.
 */
export function getDatabaseAdapter(
  ref: string = ".root",
  userConfig: TDatabaseAdapterConfig = {
    userId: "user",
    userName: "User",
    userColor: "#ff00f3",
  },
): IMockDatabaseAdapter {
  databaseRef ||= ref;
  user ||= userConfig;
  return databaseAdapter;
}
