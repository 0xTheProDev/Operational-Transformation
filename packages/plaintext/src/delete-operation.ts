import { NoopError } from "@ot/utils";
import { ITextOperation, TTextOperationAttributes } from "./operation";

/**
 * @internal
 * Delete Operation - Delete Characters starting from current Cursor position in the content.
 * @param characterCount - Number of characters to Delete.
 * @param attributes - Additional Metadata attached with Delete operation.
 */
export class DeleteOperation implements ITextOperation {
  protected _characterCount: number;

  constructor(characterCount: number) {
    this._characterCount = characterCount;
  }

  isInsert(): boolean {
    return false;
  }

  isDelete(): boolean {
    return true;
  }

  isRetain(): boolean {
    return false;
  }

  equals(other: ITextOperation): boolean {
    return other.isDelete() && other.characterCountEqual(this._characterCount);
  }

  attributesEqual(_otherAttributes: TTextOperationAttributes | null): boolean {
    throw new NoopError("Delete operation does not have any attributes.");
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
    throw new NoopError("Can not add text to delete operation.");
  }

  setTextContent(_text: string): void {
    throw new NoopError("Can not add text to delete operation.");
  }

  characterCount(): number {
    return this._characterCount;
  }

  textContent(): string {
    throw new NoopError("Can get text from delete operation.");
  }

  hasEmptyAttributes(): boolean {
    return true;
  }

  getAttributes(): TTextOperationAttributes | null {
    return null;
  }

  toString(): string {
    return `DELETE ${this._characterCount}`;
  }

  valueOf(): number {
    return -this._characterCount;
  }
}
