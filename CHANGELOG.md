# Changelog

## [1.0.0] - 18.01.2023

- Initial release

## [1.0.1] - 19.01.2023

- Added MIT license
- Update missing icons etc.

## [1.0.2] - 29.01.2023

- Added better error handling

## [1.0.3] - 01.03.2023

- Fixed parsing bug when only one port was open
- Code refactoring

## [1.0.4] - 08.03.2023

- Fixed parsing bug when only one host was open
- Fixed OS detection bug

## [1.0.5] - 15.04.2023

- Fixed bug for host being offline
- Fixed bug for single host, where no ip was shown

## [2.0.0] - 10.12.2023

- Massive rewrite of the code
- Uses `WebView` intead of `TreeView`, which offers more flexibility
- Filtering option
- Better UI with more options and interactions

## [2.0.1] - 12.12.2023

- Fixed bug where the app crashed when host was down
- Added better error handling

## [2.0.2] - 22.12.2023
- Added new search filters
- Improved GUI for better readability
- Updated the host view to show open ports instead of scanned ports
- Added VS Code tests to avoid bugs


## [2.1.0] - 20.02.2025
- Fixed bug with `pnumber` filter
- `pnumber` now returns only the matching port for each host
- Added option to export filtered results in 3 formats
    - JSON
    - CSV
    - host:port
- Best Script visbility
- Added Fingerprint support
- Updated dependancies