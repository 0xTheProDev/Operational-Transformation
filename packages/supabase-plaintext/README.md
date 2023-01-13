# `@otjs/supabase-plaintext`

[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/0xTheProDev)
[![Npm Version](https://img.shields.io/npm/v/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![Node Version](https://img.shields.io/node/v/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![Types](https://img.shields.io/npm/types/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![License](https://img.shields.io/npm/l/@otjs/supabase-plaintext?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/supabase-plaintext/LICENSE)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/supabase-plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/supabase-plaintext)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/supabase-plaintext?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Stars](https://img.shields.io/github/stars/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/stargazers)
[![Forks](https://img.shields.io/github/forks/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/network/members)
[![Discussions](https://img.shields.io/github/discussions/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/discussions)

## Description

> Database Adapter implementation for Supabase.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

  ```sh
  $ yarn add @otjs/supabase-plaintext
  ```

- To install using [Npm](https://www.npmjs.com):

  ```sh
  $ npm i @otjs/supabase-plaintext --save
  ```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![PlainText](https://img.shields.io/npm/dependency-version/@otjs/supabase-plaintext/peer/@otjs/plaintext?style=for-the-badge)](https://www.npmjs.com/package/@otjs/plaintext)
[![PlainText Editor](https://img.shields.io/npm/dependency-version/@otjs/supabase-plaintext/peer/@otjs/plaintext-editor?style=for-the-badge)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Supabase](https://img.shields.io/npm/dependency-version/@otjs/supabase-plaintext/peer/@supabase/supabase-js?style=for-the-badge)](https://www.npmjs.com/package/@supabase/supabase-js)

## Usage

```ts
import { SupabaseAdapter } from "@otjs/supabase-plaintext";

const supabaseAdapter = new SupabaseAdapter({
  databaseRef:  // Database Reference in Supabase Realtime DB
  userId:       // Unique Identifier for current user
  userColor:    // Unique Color Code for current user
  userName:     // Human readable Name or Short Name (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We don't have any Unit Test Suite for `@otjs/supabase-plaintext`. Please refer to root [README](https://github.com/0xTheProDev/Operational-Transformation/blob/main/README.md) for details regarding Integration Test Suite that concerns supabase.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/0xTheProDev/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/0xTheProDev/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/supabase-plaintext/LICENSE) for more details.
