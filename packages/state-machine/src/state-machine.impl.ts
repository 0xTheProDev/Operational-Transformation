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

import { IOperation } from "@otjs/types";
import { assert, NoopError } from "@otjs/utils";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";
import { synchronized } from "./synchronized";
import { ITransitionHandler } from "./transition-handler";

/**
 * @public
 * State Machine - Handles all incoming and outgoing operations and manages serializability to keep content synced acorss all clients.
 *
 * @param handler - Handler for invoking side-effects in outside world.
 */
export class StateMachine implements IStateMachine {
  protected _state: IState = synchronized;
  protected _handler: ITransitionHandler | null;

  constructor(handler: ITransitionHandler) {
    this._handler = handler;
  }

  dispose() {
    this._handler = null;
  }

  isSynchronized(): boolean {
    return this._state.isSynchronized();
  }

  isAwaitingConfirm(): boolean {
    return this._state.isAwaitingConfirm();
  }

  isAwaitingWithBuffer(): boolean {
    return this._state.isAwaitingWithBuffer();
  }

  protected _setState(state: IState): void {
    this._state = state;
  }

  applyClient(operation: IOperation): void {
    this._setState(this._state.applyClient(this, operation));
  }

  applyServer(operation: IOperation): void {
    this._setState(this._state.applyServer(this, operation));
  }

  serverAck(): void {
    this._setState(this._state.serverAck(this));
  }

  serverRetry(): void {
    this._setState(this._state.serverRetry(this));
  }

  applyOperation(operation: IOperation): void {
    assert(
      this._handler != null,
      new NoopError(
        "Can not call `applyOperation` after state machine have been disposed!"
      )
    );
    this._handler!.applyOperation(operation);
  }

  sendOperation(operation: IOperation): void {
    assert(
      this._handler != null,
      new NoopError(
        "Can not call `sendOperation` after state machine have been disposed!"
      )
    );
    this._handler!.sendOperation(operation);
  }
}
