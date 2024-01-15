# `@otjs/codemirror`

[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/0xTheProDev)
[![Npm Version](https://img.shields.io/npm/v/@otjs/codemirror?style=for-the-badge)](https://www.npmjs.com/package/@otjs/codemirror)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/codemirror?style=for-the-badge)](https://www.npmjs.com/package/@otjs/codemirror)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/codemirror?style=for-the-badge)](https://www.npmjs.com/package/@otjs/codemirror)
[![Types](https://img.shields.io/npm/types/@otjs/codemirror?style=for-the-badge)](https://www.npmjs.com/package/@otjs/codemirror)
[![License](https://img.shields.io/npm/l/@otjs/codemirror?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/codemirror/LICENSE)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/codemirror?style=for-the-badge)](https://www.npmjs.com/package/@otjs/codemirror)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/codemirror?style=for-the-badge)](https://www.npmjs.com/package/@otjs/codemirror)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/codemirror?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Stars](https://img.shields.io/github/stars/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/stargazers)
[![Forks](https://img.shields.io/github/forks/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/network/members)
[![Discussions](https://img.shields.io/github/discussions/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/discussions)

## Description

> Editor Adapter implementation for CodeMirror.

## Installation

- To install using [Pnpm](https://pnpm.io) _(recommended)_:

  ```sh
  pnpm add @otjs/codemirror
  ```

- To install using [Yarn](https://yarnpkg.com):

  ```sh
  yarn add @otjs/codemirror
  ```

- To install using [Npm](https://www.npmjs.com):

  ```sh
  npm i @otjs/codemirror --save
  ```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![CodeMirror Editor](https://img.shields.io/npm/dependency-version/@otjs/codemirror/peer/codemirror?style=for-the-badge)](https://codemirror.net/)

## Usage

---

```ts
import { CodeMirrorAdapter } from "@otjs/codemirror";

const codeMirrorAdapter = new CodeMirrorAdapter({
  editor:                   // CodeMirror Editor Instance
  announcementDuration:     // Duration (in ms) of User Name Announcement beside Cursor (optional)
  bindEvents:               // Boolean on whether or not to emit events from Adapter (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We don't have any Unit Test Suite for `@otjs/codemirror`. Please refer to root [README](https://github.com/0xTheProDev/Operational-Transformation/blob/main/README.md) for details regarding Integration Test Suite that concerns CodeMirror.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/0xTheProDev/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/0xTheProDev/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/codemirror/LICENSE) for more details.
