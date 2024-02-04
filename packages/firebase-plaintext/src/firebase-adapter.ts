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
  DatabaseReference,
  DataSnapshot,
  child,
  onDisconnect,
  serverTimestamp,
  runTransaction,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  set,
  query,
  startAt,
  OnDisconnect,
  onValue,
  remove,
} from "firebase/database";
import {
  IPlainTextOperation,
  PlainTextOperation,
  TPlainTextOperation,
} from "@otjs/plaintext";
import {
  TCursor,
  ICursor,
  DatabaseAdapterEvent,
  IDatabaseAdapter,
  TDatabaseAdapterEventArgs,
} from "@otjs/plaintext-editor";
import {
  ICancelable,
  ICancelableCollection,
  IDisposableCollection,
  IThenableCollection,
} from "@otjs/types";
import {
  assert,
  CancelableCollection,
  Disposable,
  DisposableCollection,
  EventEmitter,
  InvalidOperationError,
  ThenableCollection,
  TransactionFailureError,
} from "@otjs/utils";
import {
  TCheckPointData,
  TCursorData,
  TOperationData,
  TParsedRevision,
  TRevisionHistory,
  TSentOperation,
} from "./internal-types";
import { parseRevision, revisionFromId, revisionToId } from "./revision";
import {
  clearCache,
  getCheckpointRef,
  getHistoryRef,
  getRevisionRef,
  getUserColorRef,
  getUserCursorRef,
  getUserNameRef,
  getUsersRef,
} from "./reference";
import { TFirebaseAdapterConstructionOptions } from "./external-types";

/**
 * @public
 * Create Database Adapter for Plain Text Editor using Firebase as Source of Truth for Persistence.
 * @param constructorOptions - A Configuration Object consisting Database Reference and User Information.
 */
export class FirebaseAdapter
  extends EventEmitter<DatabaseAdapterEvent, TDatabaseAdapterEventArgs>
  implements IDatabaseAdapter
{
  protected readonly _toCancel: ICancelableCollection =
    new CancelableCollection();
  protected readonly _toDispose: IDisposableCollection =
    new DisposableCollection();
  protected readonly _toResolve: IThenableCollection = new ThenableCollection();

  protected _disposed: boolean = false;
  protected _initialRevisions: boolean = false;
  protected _ready: boolean = false;
  protected _revision: number = 0;
  protected _sent: TSentOperation | null = null;
  protected _checkpointRevision!: number;
  protected _userId!: string;
  protected _userColor!: string;
  protected _userName: string | null = null;
  protected _userCursor: ICursor | null = null;
  protected _databaseRef: DatabaseReference;

  /**
   * This is used for two purposes:
   * 1) On initialization, we fill this with the latest checkpoint and any subsequent operations and then
   *    process them all together.
   * 2) If we ever receive revisions out-of-order (e.g. rev 5 before rev 4), we queue them here until it's time
   *    for them to be handled. [this should never happen with well-behaved clients; but if it /does/ happen we want
   *    to handle it gracefully.]
   */
  protected readonly _pendingReceivedRevisions: TRevisionHistory = {};

  /**
   * We store the current document state as a PlainTextOperation so we can write checkpoints to Firebase occasionally.
   * TODO: Consider more efficient ways to do this (composing text operations is ~linear in the length of the document).
   */
  protected _document: IPlainTextOperation = new PlainTextOperation();

  /** Frequency of Text Operation to mark as checkpoint */
  protected static readonly CHECKPOINT_FREQUENCY: number = 100;

  /**
   * Creates a Database adapter for Firebase.
   * @param databaseRef - Firebase Database Reference.
   * @param userId - Unique Identifier of the User.
   * @param userColor - Color of the Cursor of the User.
   * @param userName - Name of the Cursor of the User.
   */
  constructor({
    databaseRef,
    userId,
    userColor,
    userName,
  }: TFirebaseAdapterConstructionOptions) {
    super();
    this._databaseRef = databaseRef;

    /** Add User Information */
    this.setUserId(userId);
    this.setUserColor(userColor);
    this.setUserName(userName);

    this._init();
  }

  protected _init(): void {
    const connectedRef = child(this._databaseRef.root, ".info/connected");

    this._toDispose.push(
      clearCache(),
      Disposable.create(
        onValue(connectedRef, (snapshot: DataSnapshot) => {
          /* istanbul ignore else */
          if (snapshot.val() === true) {
            this._initializeUserData();
          }
        }),
      ),
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

    this._toCancel.cancel();
    this._toDispose.dispose();
    this._toResolve.dispose();

    // @ts-expect-error
    this._databaseRef = null;

    // @ts-expect-error
    this._document = null;
    this._sent = null;
    this._userCursor = null;
    this._disposed = true;
  }

  getDocument(): IPlainTextOperation | null {
    return this._document;
  }

  isCurrentUser(clientId: string): boolean {
    return this._userId == clientId;
  }

  /**
   * Setup user indicator data and hooks in `users` node in Firebase ref.
   */
  protected async _initializeUserData(): Promise<void> {
    this._toCancel.push(
      onDisconnect(
        getUserColorRef({
          databaseRef: this._databaseRef,
          userId: this._userId,
        }),
      ),
      onDisconnect(
        getUserCursorRef({
          databaseRef: this._databaseRef,
          userId: this._userId,
        }),
      ),
      onDisconnect(
        getUserNameRef({
          databaseRef: this._databaseRef,
          userId: this._userId,
        }),
      ),
    );

    this._toCancel.forEach((cancelable: ICancelable) =>
      this._toResolve.push((cancelable as OnDisconnect).remove()),
    );

    this.sendCursor(this._userCursor);
  }

  /**
   * Fetch latest Document state from `checkpoint` node of Firebase ref once.
   */
  protected _monitorHistory(): void {
    /** Get the latest checkpoint as a starting point so we don't have to re-play entire history. */
    const checkPointNode = getCheckpointRef({ databaseRef: this._databaseRef });

    this._toDispose.push(
      Disposable.create(
        onValue(checkPointNode, this._handleCheckPointRevision, {
          onlyOnce: true,
        }),
      ),
    );
  }

  protected _handleCheckPointRevision = (snapshot: DataSnapshot): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the checkpoint data. */
      return;
    }

    const revisionId: string | null = snapshot.child("id").val();
    const op: TPlainTextOperation | null = snapshot.child("o").val();
    const author: string | null = snapshot.child("a").val();

    if (op != null && revisionId != null && author != null) {
      this._pendingReceivedRevisions[revisionId] = { o: op, a: author };
      this._checkpointRevision = revisionFromId(revisionId);
      this._monitorHistoryStartingAt(this._checkpointRevision + 1);
    } else {
      this._checkpointRevision = 0;
      this._monitorHistoryStartingAt(this._checkpointRevision);
    }
  };

  /**
   * Callback listener for `child_added` event on `history` node of Firebase ref.
   * @param revisionSnapshot - JSON serializable data snapshot of the child.
   */
  protected _revisionAdded = (revisionSnapshot: DataSnapshot): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the checkpoint data. */
      return;
    }

    const revisionId: string = revisionSnapshot.key as string;
    const revisionData = revisionSnapshot.val();

    this._pendingReceivedRevisions[revisionId] = revisionData as TOperationData;

    /* istanbul ignore else */
    if (this._ready) {
      this._handlePendingReceivedRevisions();
    }
  };

  /**
   * Attach listeners for `child_added` event on `history` node of Firebase ref after given entry, and apply changes that are pending in `history` node.
   * @param revision - Intial revision to start monitoring from.
   */
  protected _monitorHistoryStartingAt(revision: number): void {
    const historyRef = query(
      getHistoryRef({ databaseRef: this._databaseRef }),
      startAt(null, revisionToId(revision)),
    );

    this._toDispose.push(
      Disposable.create(onChildAdded(historyRef, this._revisionAdded)),
      Disposable.create(
        onValue(historyRef, this._handleInitialRevisions, { onlyOnce: true }),
      ),
    );
  }

  /**
   * Apply all pending changes in `history` node that aren't yet checked in into `checkpoint`, and then mark connection to be Ready.
   */
  protected _handleInitialRevisions = (): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the data. */
      return;
    }

    assert(this._ready === false, "Should not be called multiple times.");

    /* istanbul ignore else */
    if (!this._initialRevisions) {
      this._initialRevisions = true;
      this._trigger(DatabaseAdapterEvent.InitialRevision, undefined);
    }

    /** Compose the checkpoint and all subsequent revisions into a single operation to apply at once. */
    this._revision = this._checkpointRevision;

    let revisionId = revisionToId(this._revision);
    const pending = this._pendingReceivedRevisions;

    while (pending[revisionId] != null) {
      const revision: TParsedRevision | null = parseRevision(
        this._document,
        pending[revisionId],
      );

      /* istanbul ignore if */
      if (!revision) {
        /** If a misbehaved client adds a bad operation, just ignore it. */
        console.log("Invalid operation.", revisionId, pending[revisionId]);
      } else {
        this._document = this._document.compose(revision.operation);
      }

      delete pending[revisionId];
      this._revision++;

      revisionId = revisionToId(this._revision);
    }

    this._trigger(DatabaseAdapterEvent.Operation, this._document);
    this._ready = true;

    setTimeout(() => {
      this._trigger(DatabaseAdapterEvent.Ready, true);
    });
  };

  /**
   * Handle scenario when own revision gets added as `child` in history node.
   * Returns if a Retry is needed.
   */
  protected _handleSelfReceivedRevision(revision: TParsedRevision): boolean {
    let triggerRetry: boolean = false;

    /* istanbul ignore else */
    if (
      this._sent!.op.equals(revision.operation) &&
      revision.author == this._userId
    ) {
      /** This is our change; it succeeded. */
      if (this._revision % FirebaseAdapter.CHECKPOINT_FREQUENCY === 0) {
        this._saveCheckpoint(this._revision - 1, this._document.toJSON());
      }
      this._sent = null;
      this._trigger(DatabaseAdapterEvent.Acknowledge, undefined);
    } else {
      /** our op failed.  Trigger a retry after we're done catching up on any incoming ops. */
      triggerRetry = true;
      this._trigger(DatabaseAdapterEvent.Operation, revision.operation);
    }

    return triggerRetry;
  }

  /**
   * Apply incoming changes from newly added child in `history` node of Firebase ref.
   */
  protected _handlePendingReceivedRevisions(): void {
    const pending = this._pendingReceivedRevisions;

    let revisionId = revisionToId(this._revision);
    let triggerRetry = false;

    while (pending[revisionId] != null) {
      this._revision++;

      const revision: TParsedRevision | null = parseRevision(
        this._document,
        pending[revisionId],
      );

      /* istanbul ignore if */
      if (!revision) {
        /** If a misbehaved client adds a bad operation, just ignore it. */
        console.log("Invalid operation.", revisionId, pending[revisionId]);
      } else {
        this._document = this._document.compose(revision.operation);

        if (this._sent && revisionId === this._sent.id) {
          /** We have an outstanding change at this revision id. */
          triggerRetry = this._handleSelfReceivedRevision(revision);
        } else {
          this._trigger(DatabaseAdapterEvent.Operation, revision.operation);
        }

        delete pending[revisionId];
        revisionId = revisionToId(this._revision);
      }
    }

    /* istanbul ignore if */
    if (triggerRetry) {
      this._sent = null;
      this._trigger(DatabaseAdapterEvent.Retry, undefined);
    }
  }

  async sendOperation(operation: IPlainTextOperation): Promise<boolean> {
    assert(
      this._disposed === false,
      "Cannot send operation after Adapter has been disposed!",
    );

    /** If we're not ready yet, do nothing right now, and trigger a retry when we're ready. */
    if (!this._ready) {
      this.on(
        DatabaseAdapterEvent.Ready,
        /* istanbul ignore next */ () => {
          this._trigger(DatabaseAdapterEvent.Retry, undefined);
        },
      );
      return false;
    }

    /** Sanity check that this operation is valid. */
    if (!this._document.canMergeWith(operation)) {
      const error = new InvalidOperationError(
        "sendOperation() called with an invalid operation.",
      );
      this._trigger(DatabaseAdapterEvent.Error, {
        err: error,
        operation: operation.toString(),
        document: this._document.toString(),
      });
      throw error;
    }

    /** Convert revision into an id that will sort properly lexicographically. */
    const revisionId = revisionToId(this._revision);

    this._sent = { id: revisionId, op: operation };
    const revisionData: TOperationData = {
      a: this._userId,
      o: operation.toJSON(),
      t: serverTimestamp(),
    };

    return this._doTransaction(revisionId, revisionData);
  }

  /**
   * Perform Insert transaction Text Operation into given Revision ID in `history` node of Firebase ref.
   * @param revisionId - Revision ID.
   * @param revisionData - Text Operation and metadata in JSON format.
   * @param callback - Success/Error callback handler.
   */
  protected async _doTransaction(
    revisionId: string,
    revisionData: TOperationData,
  ): Promise<boolean> {
    const revisionNode: DatabaseReference = getRevisionRef({
      databaseRef: this._databaseRef,
      revisionId,
    });

    try {
      const { committed } = await runTransaction(
        revisionNode,
        (current: TOperationData | void): TOperationData | void => {
          /* istanbul ignore else */
          if (current == null) {
            return revisionData;
          }
        },
        {
          applyLocally: false,
        },
      );

      return committed;
    } catch (error) {
      /* istanbul ignore next */ {
        if (this._disposed) {
          return false;
        }

        /** Unknown Error, just inform consumer app about the failure */
        if (error == null) {
          return false;
        }

        /** Failed due to network inconsistency, retry */
        if ((error as Error).message === "disconnect") {
          /** We haven't seen our transaction succeed or fail.  Send it again. */
          if (this._sent && this._sent.id === revisionId) {
            setTimeout(() => {
              if (this._disposed) {
                return false;
              }

              this._doTransaction(revisionId, revisionData);
            });
          }

          return false;
        }

        const err = new TransactionFailureError();
        this._trigger(DatabaseAdapterEvent.Error, {
          err,
          operation: revisionData.o.toString(),
          document: this._document.toString(),
        });
        throw err;
      }
    }
  }

  /**
   * Updates current document state into `checkpoint` node in Firebase.
   */
  protected _saveCheckpoint(
    revision: number,
    document: TPlainTextOperation,
  ): void {
    const checkPointNode = getCheckpointRef({ databaseRef: this._databaseRef });
    const checkPointData: TCheckPointData = {
      a: this._userId,
      o: document,
      id: revisionToId(revision),
    };

    runTransaction(
      checkPointNode,
      (current: TCheckPointData | void): TCheckPointData | void => {
        if (current == null || revisionFromId(current.id) < revision) {
          return checkPointData;
        }
      },
    ).catch(
      /* istanbul ignore next */ (error) => {
        if (this._disposed) {
          return false;
        }

        /** If failed due to any network issue, retry */
        if (error && error.message === "disconnect") {
          setTimeout(() => {
            if (this._disposed) {
              return false;
            }

            this._saveCheckpoint(revision, document);
          });
        }
        /** Ignore any other Error */
      },
    );
  }

  isHistoryEmpty(): boolean {
    assert(this._ready, "Not ready yet.");
    return this._revision === 0;
  }

  setUserId(userId: string): void {
    assert(
      this._disposed === false,
      "Cannot set User Id after Adapter has been disposed!",
    );

    assert(
      typeof userId === "string",
      new TypeError("User Id must be a String."),
    );

    /* istanbul ignore if */
    if (this._userId === userId) {
      return;
    }

    if (this._userId) {
      /**
       * Clean up existing data. Avoid nuking another user's data
       * (if a future user takes our old name).
       */
      this._toResolve.push(
        remove(
          getUserColorRef({
            databaseRef: this._databaseRef,
            userId: this._userId,
          }),
        ),
        remove(
          getUserCursorRef({
            databaseRef: this._databaseRef,
            userId: this._userId,
          }),
        ),
      );
      this._toCancel.cancel();
    }

    this._userId = userId;
    this._initializeUserData();
  }

  setUserColor(userColor: string): void {
    assert(
      this._disposed === false,
      "Cannot set User Color after Adapter has been disposed!",
    );

    assert(
      typeof userColor === "string",
      new TypeError("User Color must be a String."),
    );

    /* istanbul ignore if */
    if (!this._databaseRef || this._userColor === userColor) {
      return;
    }

    const userColorRef = getUserColorRef({
      databaseRef: this._databaseRef,
      userId: this._userId,
    });
    this._toResolve.push(set(userColorRef, userColor));
    this._userColor = userColor;
  }

  setUserName(userName: string | null = null): void {
    assert(
      this._disposed === false,
      "Cannot set User Name after Adapter has been disposed!",
    );

    /* istanbul ignore if */
    if (!this._databaseRef || this._userName === userName) {
      return;
    }

    assert(
      typeof userName === "string",
      new TypeError("User Name must be a String."),
    );

    const userNameRef = getUserNameRef({
      databaseRef: this._databaseRef,
      userId: this._userId,
    });
    this._toResolve.push(set(userNameRef, userName));
    this._userName = userName;
  }

  async sendCursor(cursor: ICursor | null): Promise<void> {
    assert(
      this._disposed === false,
      "Cannot send cursor after Adapter has been disposed!",
    );

    assert(
      cursor == null || typeof cursor.toJSON === "function",
      new TypeError("Cursor must be null or ICursor implementation."),
    );

    const cursorRef = getUserCursorRef({
      databaseRef: this._databaseRef,
      userId: this._userId,
    });

    const cursorData: TCursor | null = cursor != null ? cursor.toJSON() : null;

    this._toResolve.push(set(cursorRef, cursorData));
    this._userCursor = cursor;

    await this._toResolve.all();
  }

  /**
   * Callback listener for `child_added` and `child_changed` events on `users` node of Firebase ref.
   * @param childSnap - JSON serializable data snapshot of the child.
   */
  protected _cursorChanged = (childSnap: DataSnapshot): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the users data. */
      return;
    }

    const userId = childSnap.key as string;
    const userData = childSnap.val() as TCursorData;

    this._trigger(DatabaseAdapterEvent.CursorChange, {
      clientId: userId,
      cursor: userData.cursor,
      userColor: userData.color,
      userName: userData.name,
    });
  };

  /**
   * Callback listener for `child_removed` events on `users` node of Firebase ref.
   * @param childSnap - JSON serializable data snapshot of the child.
   */
  protected _cursorRemoved = (childSnap: DataSnapshot): void => {
    /* istanbul ignore if */
    if (this._disposed) {
      /** just in case we were cleaned up before we got the users data. */
      return;
    }

    const userId = childSnap.key as string;
    this._trigger(DatabaseAdapterEvent.CursorChange, {
      clientId: userId,
      cursor: null,
    });
  };

  /**
   * Attach listeners for `child_added`, `child_changed` and `child_removed` event on `users` node of Firebase ref.
   */
  protected _monitorCursors(): void {
    const usersRef = getUsersRef({ databaseRef: this._databaseRef });

    this._toDispose.push(
      Disposable.create(onChildAdded(usersRef, this._cursorChanged)),
      Disposable.create(onChildChanged(usersRef, this._cursorChanged)),
      Disposable.create(onChildRemoved(usersRef, this._cursorRemoved)),
    );
  }
}

export {
  EventEmitter,
  ICancelable,
  ICancelableCollection,
  IDisposableCollection,
  IThenableCollection,
};
export { IDisposable, IEventEmitter, IThenable } from "@otjs/types";
