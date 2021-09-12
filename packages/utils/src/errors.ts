/* istanbul ignore file */

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

/**
 * Assertion Error: Error when an Assumption/Assertion Fails.
 */
export class AssertionError extends Error {
  readonly name: string = "Assertion Failed";
}

/**
 * No-op Error: Unexpected method call without any executable code.
 */
export class NoopError extends Error {
  readonly name: string = "No-op Encountered";
  readonly message: string = "This method should not have been called!";
}

/**
 * Invalid Operation Error: Executing an Invalid Operation.
 */
export class InvalidOperationError extends Error {
  readonly name: string = "Invalid Operation Encountered";
  readonly message: string =
    "The Operation recieved was either Invalid or Corrupted, please retry!";
}

/**
 * Transaction Failure Error: Failed to update some reference in Database.
 */
export class TransactionFailureError extends Error {
  readonly name: string = "Transaction Failure";
  readonly message: string = "Failed to update in the Database";
}

/**
 * DOM Failure Error: Failed to Query or Mutate some DOM Node.
 */
export class DOMFailureError extends Error {
  readonly name: string = "DOM Operation Failure";
  readonly message: string = "Failed to Query or Mutate some DOM Node";
}
