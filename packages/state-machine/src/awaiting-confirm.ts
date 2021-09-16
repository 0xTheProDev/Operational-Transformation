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
import { IState } from "./state";
import { IStateMachine } from "./state-machine";
import { synchronized } from "./synchronized";
import { AwaitingWithBuffer } from "./awaiting-with-buffer";

/**
 * In the `AwaitingConfirm` state, there's one operation the client has sent
 * to the server and is still waiting for an acknowledgement.
 *
 * @param outstanding - Operation waiting to be Acknowledged by server.
 */
export class AwaitingConfirm implements IState {
  protected readonly _outstanding: IOperation;

  constructor(outstanding: IOperation) {
    // Save the pending operation
    this._outstanding = outstanding;
  }

  isSynchronized(): boolean {
    return false;
  }

  isAwaitingConfirm(): boolean {
    return true;
  }

  isAwaitingWithBuffer(): boolean {
    return false;
  }

  applyClient(_client: IStateMachine, operation: IOperation): IState {
    // When the user makes an edit, don't send the operation immediately,
    // instead switch to 'AwaitingWithBuffer' state
    return new AwaitingWithBuffer(this._outstanding, operation);
  }

  applyServer(client: IStateMachine, operation: IOperation): IState {
    // This is another client's operation. Visualization:
    //
    //                   /\
    // this.outstanding /  \ operation
    //                 /    \
    //                 \    /
    //  pair[1]         \  / pair[0] (new outstanding)
    //  (can be applied  \/
    //  to the client's
    //  current document)

    const pair = this._outstanding.transform(operation);
    client.applyOperation(pair[1]);
    return new AwaitingConfirm(pair[0]);
  }

  serverAck(_client: IStateMachine): IState {
    // The client's operation has been acknowledged
    // => switch to synchronized state
    return synchronized;
  }

  serverRetry(client: IStateMachine): IState {
    client.sendOperation(this._outstanding);
    return this;
  }
}
