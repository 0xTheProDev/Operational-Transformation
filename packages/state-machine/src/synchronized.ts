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

import { IOperation } from "@operational-transformation/types";
import { NoopError } from "@operational-transformation/utils";
import { AwaitingConfirm } from "./awaiting-confirm";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";

/**
 * @internal
 * In the `Synchronized` state, there's no pending operation to sync between the server and the client.
 */
class Synchronized implements IState {
  isSynchronized(): boolean {
    return true;
  }

  isAwaitingConfirm(): boolean {
    return false;
  }

  isAwaitingWithBuffer(): boolean {
    return false;
  }

  applyClient(client: IStateMachine, operation: IOperation): IState {
    // When the user makes an edit, send the operation to the server and
    // switch to the 'AwaitingConfirm' state
    client.sendOperation(operation);
    return new AwaitingConfirm(operation);
  }

  applyServer(client: IStateMachine, operation: IOperation): IState {
    // When we receive a new operation from the server, the operation can be
    // simply applied to the current document
    client.applyOperation(operation);
    return this;
  }

  serverAck(_client: IStateMachine): IState {
    throw new NoopError();
  }

  serverRetry(_client: IStateMachine): IState {
    throw new NoopError();
  }
}

/**
 * @internal
 * Singleton instance of `Synchronized` state, there's no pending operation to sync between the server and the client.
 */
export const synchronized = new Synchronized();
