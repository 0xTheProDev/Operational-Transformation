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

import { IOperation } from "@otjs/types";
import { AwaitingConfirm } from "./awaiting-confirm";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";

/**
 * In the `AwaitingWithBuffer` state, the client is waiting for an operation
 * to be acknowledged by the server while buffering the edits the user makes.
 *
 * @param outstanding - Operation waiting to be Acknowledged by server.
 * @param buffer - Incoming edits from client.
 */
export class AwaitingWithBuffer implements IState {
  protected readonly _outstanding: IOperation;
  protected readonly _buffer: IOperation;

  constructor(outstanding: IOperation, buffer: IOperation) {
    // Save the pending operation and the user's edits since then
    this._outstanding = outstanding;
    this._buffer = buffer;
  }

  isSynchronized(): boolean {
    return false;
  }

  isAwaitingConfirm(): boolean {
    return false;
  }

  isAwaitingWithBuffer(): boolean {
    return true;
  }

  applyClient(_client: IStateMachine, operation: IOperation): IState {
    // Compose the user's changes onto the buffer
    const newBuffer = this._buffer.compose(operation);
    return new AwaitingWithBuffer(this._outstanding, newBuffer);
  }

  applyServer(client: IStateMachine, operation: IOperation): IState {
    // Operation comes from another client
    //
    //                       /\
    //     this.outstanding /  \ operation
    //                     /    \
    //                    /\    /
    //       this.buffer /  \* / pair1[0] (new outstanding)
    //                  /    \/
    //                  \    /
    //          pair2[1] \  / pair2[0] (new buffer)
    // the transformed    \/
    // operation -- can
    // be applied to the
    // client's current
    // document
    //
    // * pair1[1]

    const pair1 = this._outstanding.transform(operation);
    const pair2 = this._buffer.transform(pair1[1]);
    client.applyOperation(pair2[1]);
    return new AwaitingWithBuffer(pair1[0], pair2[0]);
  }

  serverAck(client: IStateMachine): IState {
    // The pending operation has been acknowledged
    // => send buffer
    client.sendOperation(this._buffer);
    return new AwaitingConfirm(this._buffer);
  }

  serverRetry(client: IStateMachine): IState {
    // Merge with our buffer and resend.
    const outstanding = this._outstanding.compose(this._buffer);
    client.sendOperation(outstanding);
    return new AwaitingConfirm(outstanding);
  }
}
