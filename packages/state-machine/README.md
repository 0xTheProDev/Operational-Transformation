# `@otjs/state-machine`

[![Npm Version](https://img.shields.io/npm/v/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Minified Size](https://img.shields.io/bundlephobia/min/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Types](https://img.shields.io/npm/types/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![License](https://img.shields.io/npm/l/@otjs/state-machine)](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/state-machine/LICENSE)
[![Quality](https://img.shields.io/npms-io/quality-score/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Maintainance](https://img.shields.io/npms-io/maintenance-score/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/state-machine)](https://www.npmjs.com/package/@otjs/state-machine)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/state-machine)](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Discussions](https://img.shields.io/github/discussions/Progyan1997/Operational-Transformation)](https://github.com/Progyan1997/Operational-Transformation/discussions)

## Description

> State Machine implementation to Synchronise changes among multiple clients.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

```sh
$ yarn add @otjs/state-machine
```

- To install using [Npm](https://www.npmjs.com):

```sh
$ npm i @otjs/state-machine
```

## Usage

```ts
import { ITransitionHandler, StateMachine } from "@otjs/state-machine";

const handler: ITransitionHandler = ...;

const stateMachine = new StateMachine(handler);
```

**Note:** API Guidelines will be provided with the package.

## Testing

We are using [Jest](https://jestjs.io) to form our Unit Test Suite. [Nyc _(formerly known as Istanbul)_](https://istanbul.js.org/) is used for coverage reporting.

To run all the unit test suites in local dev environment, run the following after dependencies have been installed:

```sh
$ yarn test
```

## Reporting a Bug

Head on to [**Discussion**](https://github.com/Progyan1997/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/Progyan1997/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Contributing

See [Contributing Guidelines](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/state-machine/LICENSE) for more details.
