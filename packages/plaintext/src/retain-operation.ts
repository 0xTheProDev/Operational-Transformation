import { NoopError } from "@ot/utils";
import { ITextOperation, ITextOperationAttributes } from "./operation";

/**
 * @internal
 * Retain Operation - Move Cursor over without changing the content.
 * @param characterCount - Number of characters to move over.
 * @param attributes - Additional Metadata attached with Retain operation.
 */
export class RetainOperation implements ITextOperation {
  protected _characterCount: number;
  protected readonly _attributes: ITextOperationAttributes | null;

  constructor(
    characterCount: number,
    attributes: ITextOperationAttributes | null = null
  ) {
    this._attributes = attributes;
    this._characterCount = characterCount;
  }

  isInsert(): boolean {
    return false;
  }

  isDelete(): boolean {
    return false;
  }

  isRetain(): boolean {
    return true;
  }

  equals(other: ITextOperation): boolean {
    return (
      other.isRetain() &&
      other.attributesEqual(this._attributes) &&
      other.characterCountEqual(this._characterCount)
    );
  }

  attributesEqual(otherAttributes: ITextOperationAttributes | null): boolean {
    if (otherAttributes == null || this._attributes == null) {
      return this._attributes == otherAttributes;
    }

    for (const attr in this._attributes) {
      if (this._attributes[attr] !== otherAttributes[attr]) {
        return false;
      }
    }

    for (const attr in otherAttributes) {
      if (this._attributes[attr] !== otherAttributes[attr]) {
        return false;
      }
    }

    return true;
  }

  characterCountEqual(characterCount: number): boolean {
    return this._characterCount === characterCount;
  }

  textContentEqual(_text: string): boolean {
    return false;
  }

  addCharacterCount(characterCount: number): void {
    this._characterCount += characterCount;
  }

  addTextContent(_text: string): void {
    throw new NoopError("Can not add text to retain operation.");
  }

  setTextContent(_text: string): void {
    throw new NoopError("Can not add text to retain operation.");
  }

  characterCount(): number {
    return this._characterCount;
  }

  textContent(): string {
    throw new NoopError("Can get text from retain operation.");
  }

  hasEmptyAttributes(): boolean {
    if (this._attributes == null) {
      return true;
    }

    return Object.keys(this._attributes).length === 0;
  }

  getAttributes(): ITextOperationAttributes {
    return Object.assign({}, this._attributes);
  }

  toString(): string {
    return `RETAIN ${this._characterCount}`;
  }

  valueOf(): number {
    return this._characterCount;
  }
}
