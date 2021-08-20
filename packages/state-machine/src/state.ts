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
