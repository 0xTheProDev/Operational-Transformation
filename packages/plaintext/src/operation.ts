/**
 * @public
 * Additional Metadata Data Type for Text Operation
 */
export type TTextOperationAttributeValue = number | boolean | string | symbol;

/**
 * @public
 * Additional Metadata Set for Text Operation
 */
export type TTextOperationAttributes = Record<
  string,
  TTextOperationAttributeValue
>;

/**
 * @public
 * Text Operation are essentially lists of ops. There are three types of operations:
 *
 * **Retain ops:** Advance the cursor position by a given number of characters.
 * Represented by positive ints.
 *
 * **Insert ops:** Insert a given string at the current cursor position.
 * Represented by strings.
 *
 * **Delete ops:** Delete the next n characters. Represented by negative ints.
 */
export interface ITextOperation {
  /**
   * Tests if it's an Insert Operation.
   */
  isInsert(): boolean;
  /**
   * Tests if it's a Delete Operation.
   */
  isDelete(): boolean;
  /**
   * Tests if it's a Retain Operation.
   */
  isRetain(): boolean;
  /**
   * Tests if two Individual Text Operation equal or not.
   * @param other - Another Text Operation.
   */
  equals(other: ITextOperation): boolean;
  /**
   * Tests if two Individual Text Operation have same Attributes or not.
   * @param otherAttributes - Another Text Operation Attributes.
   */
  attributesEqual(
    otherAttributes: TTextOperationAttributes | null | void
  ): boolean;
  /**
   * Tests if two Individual Text Operation have same Character Count or not.
   * @param characterCount - Another Text Operation Character Count.
   */
  characterCountEqual(characterCount: number): boolean;
  /**
   * Tests if two Individual Text Operation have same Text Content or not.
   * @param text - Another Text Operation Text Content.
   */
  textContentEqual(text: string): boolean;
  /**
   * Adds Character Count to current operation.
   * @param characterCount - Character Count to add.
   */
  addCharacterCount(characterCount: number): void;
  /**
   * Adds Text Content to current operation.
   * @param text - Text Content to add.
   */
  addTextContent(text: string): void;
  /**
   * Sets Text Content to current operation.
   * @param text - Text Content to add.
   */
  setTextContent(text: string): void;
  /**
   * Returns Character Count of current operation.
   * @param characterCount - Character Count to add.
   */
  characterCount(): number;
  /**
   * Returns Text Content of current operation.
   */
  textContent(): string;
  /**
   * Tests if this Individual Text Operation has additional Attributes.
   */
  hasEmptyAttributes(): boolean;
  /**
   * Returns additional Metadata of a Text Operation.
   */
  getAttributes(): TTextOperationAttributes | null;
  /**
   * Returns String representation of an Individual Text Operation
   */
  toString(): string;
  /**
   * Returns Primitive value of an Individual Text Operation
   */
  valueOf(): string | number;
}
