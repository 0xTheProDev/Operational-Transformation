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

import {
  DatabaseAdapterEvent,
  ICursor,
  IDatabaseAdapter,
  TDatabaseAdapterEventArgs,
} from "@otjs/plaintext-editor";
import { IPlainTextOperation, PlainTextOperation } from "@otjs/plaintext";
import {
  assert,
  Disposable,
  DisposableCollection,
  InvalidOperationError,
} from "@otjs/utils";
import { IDisposableCollection } from "@otjs/types";
import mitt, { Emitter, Handler } from "mitt";
import { PresenceChannel } from "pusher-js";
import { TPusherAdapterConstructionOptions } from "./api";
import { PusherEvents } from "./events";
import { TMember, TOperationData, TSubscriptionError } from "./internal_types";

/**
 * @public
 * Create Database Adapter for Plain Text Editor using Pusher Channel as Source of Truth for Persistence.
 * @param constructorOptions - A Configuration Object consisting Channel Reference and User Information.
 */
export class PusherAdapter implements IDatabaseAdapter {
  protected readonly _toDispose: IDisposableCollection =
    new DisposableCollection();

  protected _channel: PresenceChannel;
  protected _checkpointRevision!: number;
  protected _disposed: boolean = false;
  protected _initialRevisions: boolean = false;
  protected _ready: boolean = false;
  protected _revision: number = 0;
  protected _sent: IPlainTextOperation | null = null;
  protected _userId!: string;
  protected _userColor!: string;
  protected _userName: string | null = null;
  protected _userCursor: ICursor | null = null;
  protected _emitter: Emitter<TDatabaseAdapterEventArgs> = mitt();

  /**
   * We store the current document state as a PlainTextOperation so we can write checkpoints to Firebase occasionally.
   * TODO: Consider more efficient ways to do this (composing text operations is ~linear in the length of the document).
   */
  protected _document: IPlainTextOperation = new PlainTextOperation();

  /** Frequency of Text Operation to mark as checkpoint */
  protected static readonly CHECKPOINT_FREQUENCY: number = 100;

  constructor({
    channel,
    userColor,
    userId,
    userName,
  }: TPusherAdapterConstructionOptions) {
    this._channel = channel;

    /** Add User Information */
    this.setUserId(userId);
    this.setUserColor(userColor);
    this.setUserName(userName ?? userId);

    this._init();
  }

  on<Key extends keyof TDatabaseAdapterEventArgs>(
    event: Key,
    listener: Handler<TDatabaseAdapterEventArgs[Key]>
  ): void {
    return this._emitter.on(event, listener);
  }

  off<Key extends keyof TDatabaseAdapterEventArgs>(
    event: Key,
    listener?: Handler<TDatabaseAdapterEventArgs[Key]>
  ): void {
    return this._emitter.off(event, listener);
  }

  /** Trigger an event with optional payload */
  protected _trigger<Key extends keyof TDatabaseAdapterEventArgs>(
    event: Key,
    payload: TDatabaseAdapterEventArgs[Key]
  ): void {
    return this._emitter.emit(event, payload);
  }

  isHistoryEmpty(): boolean {
    assert(this._ready, "Not ready yet.");
    return this._revision === 0;
  }

  getDocument(): IPlainTextOperation | null {
    return this._document;
  }

  setUserId(userId: string): void {
    assert(
      this._disposed === false,
      "Cannot set User Id after Adapter has been disposed!"
    );

    assert(
      typeof userId === "string",
      new TypeError("User Id must be a String.")
    );

    /* istanbul ignore if */
    if (this._userId === userId) {
      return;
    }

    this._channel.members.setMyID(userId);
  }

  setUserColor(userColor: string): void {
    assert(
      this._disposed === false,
      "Cannot set User Color after Adapter has been disposed!"
    );

    assert(
      typeof userColor === "string",
      new TypeError("User Color must be a String.")
    );

    this._userColor = userColor;
  }

  setUserName(userName: string): void {
    assert(
      this._disposed === false,
      "Cannot set User Name after Adapter has been disposed!"
    );

    assert(
      typeof userName === "string",
      new TypeError("User Name must be a String.")
    );

    this._userName = userName;
  }

  isCurrentUser(clientId: string): boolean {
    return this._userId == clientId;
  }

  async sendOperation(operation: IPlainTextOperation): Promise<boolean> {
    assert(
      this._disposed === false,
      "Cannot send operation after Adapter has been disposed!"
    );

    /** If we're not ready yet, do nothing right now, and trigger a retry when we're ready. */
    if (!this._ready) {
      this.on(
        DatabaseAdapterEvent.Ready,
        /* istanbul ignore next */ () => {
          this._trigger(DatabaseAdapterEvent.Retry, undefined);
        }
      );
      return false;
    }

    /** Sanity check that this operation is valid. */
    if (!this._document.canMergeWith(operation)) {
      const error = new InvalidOperationError(
        "sendOperation() called with an invalid operation."
      );
      this._trigger(DatabaseAdapterEvent.Error, {
        err: error,
        operation: operation.toString(),
        document: this._document.toString(),
      });
      throw error;
    }

    this._sent = operation;

    return this._channel.trigger(PusherEvents.OPERATION, {
      author: this._userId,
      operation: operation.toJSON(),
      timestamp: Date.now(),
    });
  }

  async sendCursor(cursor: ICursor | null): Promise<void> {
    const isDone = this._channel.trigger(PusherEvents.MEMBER_CHANGED, {
      id: this._userId,
      info: {
        color: this._userColor,
        cursor,
        name: this._userName,
      },
    });

    /* istanbul ignore else */
    if (isDone) {
      this._userCursor = cursor;
    }
  }

  dispose(): void {
    /* istanbul ignore if */
    if (this._disposed) {
      return;
    }

    /* istanbul ignore if */
    if (!this._ready) {
      this.on(DatabaseAdapterEvent.Ready, () => {
        this.dispose();
      });
      return;
    }

    this._emitter.all.clear();
    // @ts-expect-error
    this._emitter = null;

    this._toDispose.dispose();

    // @ts-expect-error
    this._databaseRef = null;

    // @ts-expect-error
    this._document = null;
    this._sent = null;
    this._userCursor = null;
    this._disposed = true;
  }

  /**
   * Setup Listeners and consume initial data.
   */
  protected _init(): void {
    /** Initialise data once subscription went through */
    this._channel.bind(PusherEvents.SUBSCRIPTION_SUCCESS, () => {
      this._initializeUserData();
    });

    /** Inform Consumer about the error and self-dispose */
    this._channel.bind(
      PusherEvents.SUBSCRIPTION_ERROR,
      ({ error }: TSubscriptionError) => {
        this._trigger(DatabaseAdapterEvent.Error, {
          err: error,
        });
        this.dispose();
      }
    );

    /** Once we're initialized, start tracking users' cursors. */
    this.on(DatabaseAdapterEvent.Ready, () => {
      this._monitorCursors();
    });

    /** Avoid triggering any events until our callers have had a chance to attach their listeners. */
    setTimeout(() => {
      this._monitorHistory();
    });
  }

  /**
   * Initialise User Indicator data.
   */
  protected _initializeUserData() {
    this.sendCursor(this._userCursor);
  }

  /**
   * Synchronize document state and register handler for incoming events.
   */
  protected _monitorHistory(): void {
    this._channel.bind(PusherEvents.OPERATION, this._handleIncomingOperation);

    this._toDispose.push(
      Disposable.create(() => {
        this._channel.unbind(
          PusherEvents.OPERATION,
          this._handleIncomingOperation
        );
      })
    );

    this._ready = true;
    setTimeout(() => {
      this._trigger(DatabaseAdapterEvent.Ready, true);
    });
  }

  /**
   * Handle incoming text operations.
   * @param operationData - Payload on `operation` event.
   */
  protected _handleIncomingOperation = ({
    author,
    operation,
  }: TOperationData): void => {
    const revision = PlainTextOperation.fromJSON(operation);
    this._document = this._document.compose(revision);

    if (!this._sent) {
      this._trigger(DatabaseAdapterEvent.Operation, revision);
      return;
    }

    if (this._sent.equals(revision) && this.isCurrentUser(author)) {
      this._trigger(DatabaseAdapterEvent.Acknowledge, undefined);
      return;
    }

    this._trigger(DatabaseAdapterEvent.Operation, revision);
    this._trigger(DatabaseAdapterEvent.Retry, undefined);
  };

  /**
   * Synchronize cursor state and register handler for incoming events.
   */
  protected _monitorCursors(): void {
    // this._channel.bind(PusherEvents.MEMBER_ADDED, this._cursorChanged);
    this._channel.bind(PusherEvents.MEMBER_CHANGED, this._cursorChanged);
    this._channel.bind(PusherEvents.MEMBER_REMOVED, this._cursorRemoved);

    this._toDispose.push(
      Disposable.create(() => {
        // this._channel.unbind(PusherEvents.MEMBER_ADDED, this._cursorChanged);
        this._channel.unbind(PusherEvents.MEMBER_CHANGED, this._cursorChanged);
        this._channel.unbind(PusherEvents.MEMBER_REMOVED, this._cursorRemoved);
      })
    );
  }

  /**
   * Callback listener for `member_changed` event on Pusher channel.
   * @param member - JSON serializable data snapshot of the member.
   */
  protected _cursorChanged = (member: TMember): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the users data. */
      return;
    }

    const userData = member.info;

    this._trigger(DatabaseAdapterEvent.CursorChange, {
      clientId: member.id,
      cursor: userData.cursor,
      userColor: userData.color,
      userName: userData.name,
    });
  };

  /**
   * Callback listener for `member_removed` and `member_changed` events on Pusher channel.
   * @param member - JSON serializable data snapshot of the member.
   */
  protected _cursorRemoved = (member: TMember): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the users data. */
      return;
    }

    this._trigger(DatabaseAdapterEvent.CursorChange, {
      clientId: member.id,
      cursor: null,
    });
  };
}

export { IDisposable, IDisposableCollection } from "@otjs/types";
