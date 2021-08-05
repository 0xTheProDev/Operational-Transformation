import mitt from "mitt";

/**
 * Decorator - Proeprty Decorator Factory for isomorphic Event Emitter.
 * @returns Property Decorator to add Emitter instance as property to target object.
 */
export function InjectEmitter(): PropertyDecorator {
  return (target: Object, key: string | symbol) => {
    Object.defineProperty(target, key, {
      configurable: false,
      enumerable: false,
      value: mitt(),
      writable: false,
    });
  };
}

export { Emitter, Handler } from "mitt";
