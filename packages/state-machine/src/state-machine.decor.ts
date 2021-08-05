import { StateMachine } from "./state-machine.impl";
import { ITransitionHandler } from "./transition-handler";

/**
 * Decorator - Property Decorator Factory, should be applied to Class that implements `ITransitionHandler` interface.
 * @returns Property Decorator to add State Machine instance as property to target object.
 */
export function InjectStateMachine(): PropertyDecorator {
  return (target: Object, key: string | symbol) => {
    Object.defineProperty(target, key, {
      configurable: false,
      enumerable: false,
      value: new StateMachine(target as ITransitionHandler),
      writable: false,
    });
  };
}
