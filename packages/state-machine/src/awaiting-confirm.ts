import { IOperation } from "@ot/types";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";
import { synchronized } from "./synchronized";
import { AwaitingWithBuffer } from "./awaiting-with-buffer";

/**
 * In the `AwaitingConfirm` state, there's one operation the client has sent
 * to the server and is still waiting for an acknowledgement.
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
