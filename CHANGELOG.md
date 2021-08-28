# CHANGELOG

<!--
Read this section if it's your first time writing changelog, if not read anyway.

Guidelines:
- Don't dump commit log diffs as changelogs. Bad idea, it is.
- Changelogs are for humans, not machines.
- There should be an entry for every single version.
- The same types of changes should be grouped.
- the latest version comes first.

Tags:
- Added: for new features.
- Changed: for changes in existing functionality.
- Deprecated: for soon-to-be removed features.
- Removed: for now removed features.
- Fixed: for any bug fixes.
- Security: in case of vulnerabilities.

Good to have: commit or PR links.

-->

## [v0.1.0](https://github.com/Progyan1997/Operational-Transformation/tree/v0.1.0)

### Added

- Add package `@operational-transformation/plaintext` - Handles Trannsformation Logic related to Plain Text content and content changes.
- Add package `@operational-transformation/plaintext-editor` - Handles integration between a Plain Text Editor and a Central Server, and keeps contents of all Plain Text Editors associated with the Central Server in sync via Plain Text Operational Transformations.
- Add package `@operational-transformation/state-machine` - Handles State Transitions and Side Effects in each stages of Synchronization between Client (e.g., Editor) and Server.
