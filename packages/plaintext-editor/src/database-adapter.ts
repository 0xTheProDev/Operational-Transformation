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

import { IPlainTextOperation } from "@otjs/plaintext";
import { IDisposable, IEventEmitter } from "@otjs/types";
import { ICursor, TCursor } from "./cursor";

/**
 * @public
 * Database Adapter Events - Events exposed by Database Adapter.
 */
export enum DatabaseAdapterEvent {
  Ready = "ready",
  Retry = "retry",
  Error = "error",
  Acknowledge = "ack",
  Operation = "operation",
  CursorChange = "cursor",
  InitialRevision = "initialRevision",
}

/**
 * @public
 * Cursor Object emiited from Database Adapter.
 */
export type TDatabaseAdapterCursor = {
  /** Unique User ID of Remote User */
  clientId: string;
  /** JSON Representation of User Cursor/Selection */
  cursor: TCursor | null;
  /** Color String (Hex, HSL, RGB, Text etc.) for Cursor/Selection. */
  userColor?: string;
  /** Name/Short Name of the Remote User */
  userName?: string;
};

/**
 * @public
 * Error Object emiited from Database Adapter.
 */
export type TDatabaseAdapterError = {
  /** Error Object emitted inside Database Adapter */
  err: Error;
  /** String representation of the Plain Text Operation */
  operation: string;
  /** String representation of the current Document State (optional) */
  document?: string;
};

/**
 * @internal
 * Event Arguments for Database Adapter Events.
 */
export type TDatabaseAdapterEventArgs = {
  [DatabaseAdapterEvent.Error]: TDatabaseAdapterError;
  [DatabaseAdapterEvent.Retry]: void;
  [DatabaseAdapterEvent.Ready]: boolean;
  [DatabaseAdapterEvent.Operation]: IPlainTextOperation;
  [DatabaseAdapterEvent.Acknowledge]: void;
  [DatabaseAdapterEvent.CursorChange]: TDatabaseAdapterCursor;
  [DatabaseAdapterEvent.InitialRevision]: void;
};

/**
 * @public
 * Database Adapter Interface - This Interface should be implemented over Persistence Layer to have OT capabilities.
 */
export interface IDatabaseAdapter
  extends IDisposable,
    IEventEmitter<DatabaseAdapterEvent, TDatabaseAdapterEventArgs> {
  /**
   * Tests if any operation has been done yet on the document.
   */
  isHistoryEmpty(): boolean;
  /**
   * Returns current state of the document (could be `null`).
   */
  getDocument(): IPlainTextOperation | null;
  /**
   * Add Unique Identifier against current user to mark Cursor and Operations.
   * @param userId - Unique Identifier for current user.
   */
  setUserId(userId: string): void;
  /**
   * Set Color to mark current user's Cursor.
   * @param userColor - Hexadecimal Color code of current user's Cursor.
   */
  setUserColor(userColor: string): void;
  /**
   * Set User Name to mark current user's Cursor.
   * @param userName - Name/Short Name of current user.
   */
  setUserName(userName: string): void;
  /**
   * Tests if `clientId` matches current user's ID.
   * @param clientId - Unique Identifier for user.
   */
  isCurrentUser(clientId: string): boolean;
  /**
   * Send operation, while retrying on connection failure. Returns a Promise with commited status.
   * An exception will be thrown on transaction failure, which should only happen on
   * catastrophic failure like a security rule violation.
   *
   * @param operation - Plain Text Operation to sent to server.
   */
  sendOperation(operation: IPlainTextOperation): Promise<boolean>;
  /**
   * Send current user's cursor information to server. Returns an empty Promise.
   * @param cursor - Cursor of Current User.
   */
  sendCursor(cursor: ICursor | null): Promise<void>;
}
