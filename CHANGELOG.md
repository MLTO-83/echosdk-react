# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-28

### Fixed
- Corrected `exports` map: the CSS stylesheet is now importable as
  `@echosdk/react/dist/style.css`. The previous entry used the wrong key
  (`./styles`) and pointed to a non-existent file (`./dist/styles.css`).
- Updated all CSS import paths across source files, examples, and documentation
  to use the corrected export key.

### Documentation
- Clarified that `appId` is a **public** application identifier — not a secret —
  and is safe to ship in client-side bundles and `NEXT_PUBLIC_` environment
  variables in Next.js (e.g. `NEXT_PUBLIC_ECHOSDK_APP_ID`).
- Documented that `apiKey` on `ClientConfig` / `EchoSDKClient` is a **secret**
  Bearer token intended for server-side proxy use only. It must never be placed
  in a `NEXT_PUBLIC_` variable or any client-side bundle.
- Added a Security section to the README with a summary table and Next.js
  env-var guidance for both credentials.
- Added JSDoc comments to `ClientConfig.appId` and `ClientConfig.apiKey` so the
  security guidance surfaces in editor autocomplete at the point of use.

## [1.1.0] - 2026-02-03

### Added
- `baseUrl` prop to `EchoChat` and `EchoSDKClient` for easier API configuration.
- Improved API URL resolution logic (baseUrl > apiUrl > default).
- Comprehensive unit tests achieving >88% code coverage.
- Improved error handling for localStorage quota limits.

## [1.0.0] - 2026-01-23

### Added
- Initial release of echosdk
- Core `EchoChat` component with full customization
- `useChat` hook for state management with localStorage persistence
- `useTheme` hook for automatic theme detection
- Full TypeScript support with strict mode
- Light and dark theme variants with CSS variables
- Responsive design (mobile-first)
- Accessibility features (WCAG 2.1 AA compliant)
- Error boundaries and retry logic
- Auto-resizing message input
- Typing indicators
- SSR compatibility (Next.js tested)
- Vite example application
- Next.js example application
- Comprehensive documentation
- CI/CD with GitHub Actions
- Bundle size < 10kb gzipped

### Documentation
- Complete README with usage examples
- API reference for all props
- Contributing guidelines
- Publishing guide
- MIT License

[1.0.0]: https://github.com/echosdk-react/releases/tag/v1.0.0

