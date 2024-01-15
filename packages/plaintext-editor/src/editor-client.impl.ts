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

import { IPlainTextOperation } from "@otjs/plaintext";
import { IStateMachine, StateMachine } from "@otjs/state-machine";
import { assert, EventEmitter, NoopError } from "@otjs/utils";
import { ICursor } from "./cursor";
import { Cursor } from "./cursor.impl";
import {
  DatabaseAdapterEvent,
  IDatabaseAdapter,
  TDatabaseAdapterCursor,
  TDatabaseAdapterError,
} from "./database-adapter";
import {
  EditorAdapterEvent,
  IEditorAdapter,
  TEditorAdapterChange,
  TEditorAdapterError,
} from "./editor-adapter";
import {
  EditorClientEvent,
  IEditorClient,
  TEditorClientEventArgs,
  TEditorClientConstructionOptions,
} from "./editor-client";
import { OperationMetadata } from "./operation-metadata.impl";
import { IRemoteClient, TRemoteClientMap } from "./remote-client";
import { RemoteClient } from "./remote-client.impl";
import { IUndoManager } from "./undo-manager";
import { UndoManager } from "./undo-manager.impl";
import { IWrappedOperation } from "./wrapped-operation";
import { WrappedOperation } from "./wrapped-operation.impl";

/**
 * @public
 * Editor Client - Encapsulates Editor Adapater and Database Adapter to create Collaborative Editor experience.
 * Note that, disposing Editor Client instance won't dispose any of the adapater instances. To ensure garbage
 * collection, dispose adapters explicitly and set Editor Client instance to `null`.
 * @param databaseAdapter - Database Adapter instance.
 * @param editorAdapter - Editor Adapter instance.
 */
export class EditorClient
  extends EventEmitter<EditorClientEvent, TEditorClientEventArgs>
  implements IEditorClient
{
  protected readonly _databaseAdapter: IDatabaseAdapter;
  protected readonly _editorAdapter: IEditorAdapter;

  protected readonly _remoteClients: TRemoteClientMap = new Map();
  protected readonly _stateMachine: IStateMachine = new StateMachine(this);
  protected readonly _undoManager: IUndoManager = new UndoManager();

  protected _disposed: boolean = false;
  protected _cursor: ICursor | null = null;
  protected _focused: boolean = false;
  protected _sendCursorTimeout: NodeJS.Timeout | null = null;

  constructor({
    databaseAdapter,
    editorAdapter,
  }: TEditorClientConstructionOptions) {
    super();
    this._databaseAdapter = databaseAdapter;
    this._editorAdapter = editorAdapter;
    this._initDatabaseAdapter();
    this._initEditorAdapter();
  }

  clearUndoRedoStack(): void {
    this._undoManager.dispose();
  }

  sendOperation(operation: IPlainTextOperation): void {
    assert(
      !this._disposed,
      new NoopError(
        "Can not call `sendOperation` after editor client have been disposed!",
      ),
    );
    this._databaseAdapter.sendOperation(operation);
  }

  applyOperation(operation: IPlainTextOperation): void {
    assert(
      !this._disposed,
      new NoopError(
        "Can not call `applyOperation` after editor client have been disposed!",
      ),
    );
    this._editorAdapter.applyOperation(operation);
    this._updateCursor();
    this._undoManager.transform(new WrappedOperation(operation));
    this._emitSynced();
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }

    /* istanbul ignore if */
    if (this._sendCursorTimeout) {
      clearTimeout(this._sendCursorTimeout);
      this._sendCursorTimeout = null;
    }

    this._tearDownDatabaseAdapter();
    this._tearDownEditorAdapter();
    this._tearDownEmitter();
    this._tearDownRemoteClients();
    this._tearDownStateMachine();
    this._tearDownUndoManager();

    this._cursor = null;
    this._disposed = true;
  }

  /** Attach callbacks to Editor Adapter and bind them to Editor Client instance */
  protected _initDatabaseAdapter() {
    this._databaseAdapter.on(
      DatabaseAdapterEvent.Ready,
      this._handleDatabaseReady,
    );

    this._databaseAdapter.on(
      DatabaseAdapterEvent.Retry,
      this._handleDatabaseRetry,
    );

    this._databaseAdapter.on(
      DatabaseAdapterEvent.InitialRevision,
      this._handleInitialRevision,
    );

    this._databaseAdapter.on(
      DatabaseAdapterEvent.Acknowledge,
      this._handleDatabaseAcknowledge,
    );

    this._databaseAdapter.on(
      DatabaseAdapterEvent.CursorChange,
      this._handleCursorChange,
    );

    this._databaseAdapter.on(
      DatabaseAdapterEvent.Operation,
      this._handleIncomingOperation,
    );

    this._databaseAdapter.on(DatabaseAdapterEvent.Error, this._onError);
  }

  /** Attach callbacks to Editor Adapter and bind them to Editor Client instance */
  protected _initEditorAdapter(): void {
    this._editorAdapter.on(EditorAdapterEvent.Change, this._onChange);
    this._editorAdapter.on(EditorAdapterEvent.Cursor, this._onCursorActivity);
    this._editorAdapter.on(EditorAdapterEvent.Blur, this._onBlur);
    this._editorAdapter.on(EditorAdapterEvent.Focus, this._onFocus);
    this._editorAdapter.on(EditorAdapterEvent.Error, this._onError);

    this._editorAdapter.registerUndo(this._undo);
    this._editorAdapter.registerRedo(this._redo);
  }

  /** Detach callbacks from Database Adapter */
  protected _tearDownDatabaseAdapter() {
    this._databaseAdapter.off(
      DatabaseAdapterEvent.Ready,
      this._handleDatabaseReady,
    );

    this._databaseAdapter.off(
      DatabaseAdapterEvent.Retry,
      this._handleDatabaseRetry,
    );

    this._databaseAdapter.off(
      DatabaseAdapterEvent.InitialRevision,
      this._handleInitialRevision,
    );

    this._databaseAdapter.off(
      DatabaseAdapterEvent.Acknowledge,
      this._handleDatabaseAcknowledge,
    );

    this._databaseAdapter.off(
      DatabaseAdapterEvent.CursorChange,
      this._handleCursorChange,
    );

    this._databaseAdapter.off(
      DatabaseAdapterEvent.Operation,
      this._handleIncomingOperation,
    );

    this._databaseAdapter.off(DatabaseAdapterEvent.Error, this._onError);

    // @ts-expect-error
    this._databaseAdapter = null;
  }

  /** Detach callbacks from Editor Adapter */
  protected _tearDownEditorAdapter(): void {
    this._editorAdapter.off(EditorAdapterEvent.Change, this._onChange);
    this._editorAdapter.off(EditorAdapterEvent.Cursor, this._onCursorActivity);
    this._editorAdapter.off(EditorAdapterEvent.Blur, this._onBlur);
    this._editorAdapter.off(EditorAdapterEvent.Focus, this._onFocus);
    this._editorAdapter.off(EditorAdapterEvent.Error, this._onError);

    this._editorAdapter.deregisterUndo(this._undo);
    this._editorAdapter.deregisterRedo(this._redo);

    // @ts-expect-error
    this._editorAdapter = null;
  }

  /** Dispose Emitter to force Garbage Collection */
  protected _tearDownEmitter(): void {
    this._emitter.all.clear();

    // @ts-expect-error
    this._emitter = null;
  }

  /** Dispose Remote Clients to force Garbage Collection */
  protected _tearDownRemoteClients(): void {
    this._remoteClients.clear();

    // @ts-expect-error
    this._remoteClients = null;
  }

  /** Dispose State Machine to force Garbage Collection */
  protected _tearDownStateMachine(): void {
    this._stateMachine.dispose();

    // @ts-expect-error
    this._stateMachine = null;
  }

  /** Dispose Undo Manager to force Garbage Collection */
  protected _tearDownUndoManager(): void {
    this._undoManager.dispose();

    // @ts-expect-error
    this._undoManager = null;
  }

<<<<<<< HEAD
=======
  /** Trigger an event with optional payload */
  protected _trigger<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    payload: TEditorClientEventArgs[Key],
  ): void {
    this._emitter.emit(event, payload);
  }

>>>>>>> 6bfc2a1 (Code mirror WIP)
  /** Trigger `Synced` event with boolean payload */
  protected _emitSynced() {
    this._trigger(
      EditorClientEvent.Synced,
      this._stateMachine.isSynchronized(),
    );
  }

  /** Handles `error` event from Database Adapter or Editor Adapter */
  protected _onError = (
    err: TEditorAdapterError | TDatabaseAdapterError,
  ): void => {
    this._trigger(EditorClientEvent.Error, err);
  };

  /** Handles `ready` event from Database Adapter */
  protected _handleDatabaseReady = (): void => {
    this._trigger(EditorClientEvent.Ready, true);
  };

  /** Handles `retry` event from Database Adapter */
  protected _handleDatabaseRetry = (): void => {
    this._stateMachine.serverRetry();
  };

  /** Handles `intialRevision` event from Database Adapter */
  protected _handleInitialRevision = (): void => {
    this._editorAdapter.setInitiated();
  };

  /** Handles `ack` event from Database Adapter */
  protected _handleDatabaseAcknowledge = (): void => {
    this._stateMachine.serverAck();
    this._updateCursor();
    this._sendCursor(this._cursor);
    this._emitSynced();
  };

  /** Handles `operation` event from Database Adapter */
  protected _handleIncomingOperation = (
    operation: IPlainTextOperation,
  ): void => {
    this._stateMachine.applyServer(operation);
  };

  /** Handles `cursor` event from Database Adapter */
  protected _handleCursorChange = ({
    clientId,
    cursor,
    userColor,
    userName,
  }: TDatabaseAdapterCursor): void => {
    if (
      this._databaseAdapter.isCurrentUser(clientId) ||
      !this._stateMachine.isSynchronized()
    ) {
      return;
    }

    const client = this._getClientObject(clientId);

    if (cursor == null) {
      client.removeCursor();
      return;
    }

    if (userColor) {
      client.setColor(userColor);
    }

    if (userName) {
      client.setUserName(userName);
    }

    client.updateCursor(Cursor.fromJSON(cursor));
  };

  /** Handle `change` event from Editor Adapter */
  protected _onChange = ({
    inverse,
    operation,
  }: TEditorAdapterChange): void => {
    const cursorBefore = this._cursor;
    this._updateCursor();

    const compose =
      this._undoManager.canUndo() &&
      inverse.shouldBeComposedWithInverted(this._undoManager.last()!.operation);

    const inverseMeta = new OperationMetadata(this._cursor, cursorBefore);
    this._undoManager.add(new WrappedOperation(inverse, inverseMeta), compose);
    this._stateMachine.applyClient(operation);
  };

  /** Handle `cursor` event from Editor Adapter */
  protected _onCursorActivity = (): void => {
    const oldCursor = this._cursor;
    this._updateCursor();

    if (oldCursor == null && oldCursor == this._cursor) {
      /** Empty Cursor */
      return;
    }

    this._sendCursor(this._cursor);
  };

  /** Handle `blur` event from Editor Adapter */
  protected _onBlur = (): void => {
    this._cursor = null;
    this._sendCursor(null);
    this._focused = false;
  };

  /** Handle `focus` event from Editor Adapter */
  protected _onFocus = (): void => {
    this._focused = true;
    this._onCursorActivity();
  };

  /** Handle `undo` event from Editor Adapter */
  protected _undo = (): void => {
    if (!this._undoManager.canUndo()) {
      return;
    }

    this._undoManager.performUndo((operation: IWrappedOperation) => {
      this._applyUnredo(operation);
      this._trigger(EditorClientEvent.Undo, operation.toString());
    });
  };

  /** Handle `redo` event from Editor Adapter */
  protected _redo = (): void => {
    if (!this._undoManager.canRedo()) {
      return;
    }

    this._undoManager.performRedo((operation: IWrappedOperation) => {
      this._applyUnredo(operation);
      this._trigger(EditorClientEvent.Redo, operation.toString());
    });
  };

  /** Updates Undo Manager as per incoming events: `undo` or `redo` */
  protected _applyUnredo(wrappedOperation: IWrappedOperation) {
    const { operation, cursor } = wrappedOperation;

    this._undoManager.add(
      this._editorAdapter.invertOperation(wrappedOperation),
    );
    this._editorAdapter.applyOperation(operation);

    this._cursor = cursor;
    if (this._cursor) {
      this._editorAdapter.setCursor(this._cursor);
    }

    this._stateMachine.applyClient(operation);
  }

  /** Updates Cursor in Editor Client */
  protected _updateCursor() {
    this._cursor = this._editorAdapter.getCursor();
  }

  /** Sends latest Cursor to Database Adapter */
  protected _sendCursor(cursor: ICursor | null) {
    if (this._sendCursorTimeout) {
      clearTimeout(this._sendCursorTimeout);
      this._sendCursorTimeout = null;
    }

    if (this._stateMachine.isAwaitingWithBuffer()) {
      this._sendCursorTimeout = setTimeout(() => {
        this._sendCursor(cursor);
      }, /** Wait for at least 3ms before syncing cursor */ 3);
      return;
    }

    this._databaseAdapter.sendCursor(cursor);
  }

  /** Returns Remote Client instance for a given Remote User Id */
  protected _getClientObject(clientId: string): IRemoteClient {
    let client = this._remoteClients.get(clientId);

    if (client) {
      return client;
    }

    client = new RemoteClient(clientId, this._editorAdapter);
    this._remoteClients.set(clientId, client);

    return client;
  }
}

export type { EventEmitter };
