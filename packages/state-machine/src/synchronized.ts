import { IOperation } from "@ot/types";
import { AwaitingConfirm } from "./awaiting-confirm";
import { NoopError } from "./errors";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";

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

export const synchronized = new Synchronized();
