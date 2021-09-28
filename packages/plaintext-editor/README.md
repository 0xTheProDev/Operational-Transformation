# `@otjs/plaintext-editor`

[![Npm Version](https://img.shields.io/npm/v/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Minified Size](https://img.shields.io/bundlephobia/min/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Types](https://img.shields.io/npm/types/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![License](https://img.shields.io/npm/l/@otjs/plaintext-editor)](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/plaintext-editor/LICENSE)
[![Quality](https://img.shields.io/npms-io/quality-score/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Maintainance](https://img.shields.io/npms-io/maintenance-score/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/plaintext-editor)](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Discussions](https://img.shields.io/github/discussions/Progyan1997/Operational-Transformation)](https://github.com/Progyan1997/Operational-Transformation/discussions)

## Description

> Editor Client module to Synchronise Plain Text changes across multiple clients.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

```sh
$ yarn add @otjs/plaintext-editor
```

- To install using [Npm](https://www.npmjs.com):

```sh
$ npm i @otjs/plaintext-editor
```

## Usage

```ts
import { EditorClient, IDatabaseAdapter, IEditorAdapter } from "@otjs/plaintext-editor";

const databaseAdapter: IDatabaseAdapter = ...;
const editorAdapter: IEditorAdapter = ...;

const editorClient = new EditorClient(databaseAdapter, editorAdapter);
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

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

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/plaintext-editor/LICENSE) for more details.
