# `@otjs/quill`

[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/0xTheProDev)
[![Npm Version](https://img.shields.io/npm/v/@otjs/quill?style=for-the-badge)](https://www.npmjs.com/package/@otjs/quill)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/quill?style=for-the-badge)](https://www.npmjs.com/package/@otjs/quill)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/quill?style=for-the-badge)](https://www.npmjs.com/package/@otjs/quill)
[![Types](https://img.shields.io/npm/types/@otjs/quill?style=for-the-badge)](https://www.npmjs.com/package/@otjs/quill)
[![License](https://img.shields.io/npm/l/@otjs/quill?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/quill/LICENSE)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/quill?style=for-the-badge)](https://www.npmjs.com/package/@otjs/quill)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/quill?style=for-the-badge)](https://www.npmjs.com/package/@otjs/quill)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/quill?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Stars](https://img.shields.io/github/stars/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/stargazers)
[![Forks](https://img.shields.io/github/forks/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/network/members)
[![Discussions](https://img.shields.io/github/discussions/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/discussions)

## Description

> Editor Adapter implementation for Quill.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

  ```sh
  $ yarn add @otjs/quill
  ```

- To install using [Npm](https://www.npmjs.com):

  ```sh
  $ npm i @otjs/quill --save
  ```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![Quill Editor](https://img.shields.io/npm/dependency-version/@otjs/quill/peer/quill?style=for-the-badge)](https://quilljs.com)

## Usage

---

```ts
import { QuillAdapter } from "@otjs/quill";

const quillAdapter = new QuillAdapter({
  editor:                   // Quill Editor Instance
  announcementDuration:     // Duration (in ms) of User Name Announcement beside Cursor (optional)
  bindEvents:               // Boolean on whether or not to emit events from Adapter (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We don't have any Unit Test Suite for `@otjs/quill`. Please refer to root [README](https://github.com/0xTheProDev/Operational-Transformation/blob/main/README.md) for details regarding Integration Test Suite that concerns quill.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/0xTheProDev/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/0xTheProDev/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/quill/LICENSE) for more details.
