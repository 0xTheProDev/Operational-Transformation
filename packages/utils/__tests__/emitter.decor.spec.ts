import { IDisposable } from "@ot/types";
import { Emitter, Handler, InjectEmitter } from "../src/emitter.decor";

type CustomEvents = {
  foo: string;
  bar?: number;
};

class EmitterImplementation implements IDisposable {
  @InjectEmitter()
  protected readonly emitter!: Emitter<CustomEvents>;

  dispose() {
    this.emitter.all.clear();
  }

  listenToFooEvent(handler: Handler<string>) {
    this.emitter.on("foo", handler);
  }

  triggerFooEvent(payload: string) {
    this.emitter.emit("foo", payload);
  }

  unlistenToFooEvent(handler: Handler<string>) {
    this.emitter.off("foo", handler);
  }
}

describe("Test Emitter Decorator", () => {
  let emitter: EmitterImplementation, handler: jest.Mock;

  beforeAll(() => {
    emitter = new EmitterImplementation();
    handler = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    emitter.dispose();
    jest.restoreAllMocks();
  });

  it("should be able to attach event listener", () => {
    emitter.listenToFooEvent(handler);

    const payload = "Some Data";
    emitter.triggerFooEvent(payload);
    expect(handler).toHaveBeenCalledWith(payload);
  });

  it("should be able to detach event listener", () => {
    emitter.unlistenToFooEvent(handler);

    const payload = "Some Data";
    emitter.triggerFooEvent(payload);
    expect(handler).not.toHaveBeenCalledWith(payload);
  });
});
