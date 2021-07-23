/**
 * Isomorphic Assertion Function (Works on both Node.JS and Browser)
 * @param statement - Statement of Assertion (Evaluated for Truthy value)
 * @param message - Error Message if Assertion Fails
 */
export function assert(
  statement: boolean | undefined,
  message: string | Error
): void {
  if (typeof window === "undefined") {
    return require("assert").strict(statement, message);
  }

  console.assert(statement, message);
}
