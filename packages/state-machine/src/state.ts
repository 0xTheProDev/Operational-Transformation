import { IOperation } from "@ot/types";
import { IBase } from "./base";
import { IStateMachine } from "./state-machine";

/**
 * @public
 * State Interface - Interface for all internal States of the State Machine
 */
export interface IState extends IBase {
  /**
   * Send operation to remote users.
   * @param client - State Machine object reference.
   * @param operation - Operation from Client.
   * @returns Resultant State.
   */
  applyClient(client: IStateMachine, operation: IOperation): IState;
  /**
   * Recieve operation from remote user.
   * @param client - State Machine object reference.
   * @param operation - Operation recieved from Server.
   * @returns Resultant State.
   */
  applyServer(client: IStateMachine, operation: IOperation): IState;
  /**
   * Handle acknowledgement from Server.
   * @param client - State Machine object reference.
   * @returns Resultant State.
   */
  serverAck(client: IStateMachine): IState;
  /**
   * Handle retry with Server.
   * @param client - State Machine object reference.
   * @returns Resultant State.
   */
  serverRetry(client: IStateMachine): IState;
}
