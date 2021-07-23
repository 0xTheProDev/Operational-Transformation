import { IOperation } from "@ot/types";
import { AwaitingConfirm } from "./awaiting-confirm";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";

/**
 * In the `AwaitingWithBuffer` state, the client is waiting for an operation
 * to be acknowledged by the server while buffering the edits the user makes.
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
