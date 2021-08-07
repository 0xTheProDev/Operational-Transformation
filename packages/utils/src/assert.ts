import { AssertionError } from "./errors";

/**
 * Isomorphic Assertion Function (Works on both Node.JS and Browser)
 * @param statement - Statement of Assertion (Evaluated for Truthy value)
 * @param message - Error Message if Assertion Fails
 */
export function assert(
  statement: boolean | undefined,
  message: string | Error
): void {
  if (statement == null || statement === false) {
    const err =
      typeof message === "string" ? new AssertionError(message) : message;
    throw err;
  }
}
