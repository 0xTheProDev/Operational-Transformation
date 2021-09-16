# `@otjs/state-machine`

> State Machine implementation to Synchronise changes among multiple clients.

## Usage

```ts
import { ITransitionHandler, StateMachine } from "@otjs/state-machine";

const handler: ITransitionHandler = ...;

const stateMachine = new StateMachine(handler);
```

**Note:** API Guidelines will be provided with the package.
