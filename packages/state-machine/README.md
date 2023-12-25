# `@otjs/state-machine`

[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/0xTheProDev)
[![Npm Version](https://img.shields.io/npm/v/@otjs/state-machine?style=for-the-badge)](https://www.npmjs.com/package/@otjs/state-machine)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/state-machine?style=for-the-badge)](https://www.npmjs.com/package/@otjs/state-machine)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/state-machine?style=for-the-badge)](https://www.npmjs.com/package/@otjs/state-machine)
[![Types](https://img.shields.io/npm/types/@otjs/state-machine?style=for-the-badge)](https://www.npmjs.com/package/@otjs/state-machine)
[![License](https://img.shields.io/npm/l/@otjs/state-machine?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/state-machine/LICENSE)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/state-machine?style=for-the-badge)](https://www.npmjs.com/package/@otjs/state-machine)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/state-machine?style=for-the-badge)](https://www.npmjs.com/package/@otjs/state-machine)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/state-machine?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Stars](https://img.shields.io/github/stars/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/stargazers)
[![Forks](https://img.shields.io/github/forks/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/network/members)
[![Discussions](https://img.shields.io/github/discussions/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/discussions)

## Description

> State Machine implementation to Synchronise changes among multiple clients.

## Installation

- To install using [Pnpm](https://pnpm.io) _(recommended)_:

  ```sh
  pnpm add @otjs/ace
  ```

- To install using [Yarn](https://yarnpkg.com):

  ```sh
  yarn add @otjs/state-machine
  ```

- To install using [Npm](https://www.npmjs.com):

  ```sh
  npm i @otjs/state-machine --save
  ```

## Usage

```ts
import { ITransitionHandler, StateMachine } from "@otjs/state-machine";

const handler: ITransitionHandler = ...;

const stateMachine = new StateMachine(handler);
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We are using [Jest](https://jestjs.io) to form our Unit Test Suite. [Nyc _(formerly known as Istanbul)_](https://istanbul.js.org/) is used for coverage reporting.

To run all the unit test suites in local dev environment, run the following after dependencies have been installed:

```sh
yarn test
```

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/0xTheProDev/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/0xTheProDev/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/state-machine/LICENSE) for more details.
