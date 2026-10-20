# Changelog
All notable changes to this project will be documented in this file.

## [1.1.0]
### Added
- MarketPay callbacks (notification, success, failed and payment form) now run in the PWA on Managed Runtime through `registerMarketPayCallbacks` and are forwarded to the SFCC SCAPI endpoints. Requires the [`int_marketpay_headless` cartridge `3.0.0`](https://github.com/AltaPay/plugin-salesforce/releases/tag/3.0.0) or above.
- Callback protection: signature validation (with a 5-minute timestamp check) and a known IP allowlist.
- New environment variables for the callbacks, listed in the [README](README.md#environment-variables).

**Upgrade note**
> To use the callbacks in your own app, update your `ssr.js` as shown in the [README](README.md#using-the-module-in-your-own-app), set the new environment variables on MRT, and create an Account Manager API client with the `c_marketpaycallbacks_rw` scope.

## [1.0.1]
### Added
- Add the source code for the NPM package and updated the React retail app accordingly.

## [1.0.0] - Initial Release
- First public release
- **Supported Features:**
  - MarketPay reference React application
  - Payment flow support
  - Integration with MarketPay SFCC headless cartridge