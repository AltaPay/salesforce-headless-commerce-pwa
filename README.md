# AltaPay for Salesforce Composable Storefront B2C Commerce PWA

This repository contains the MarketPay reference react application, which can be used to demonstrate the payment flow or to support the integration of AltaPay via the Salesforce cartridge for Salesforce B2C Commerce (SFCC), and the source of the [`marketpay-salesforce-pwa`](packages/marketpay-salesforce-pwa) NPM package that the app uses.


## Setting Up and Running the App

### Prerequisites

Make sure the `int_marketpay_headless` cartridge is installed and configured in your SFCC environment from the [plugin-salesforce](https://github.com/AltaPay/plugin-salesforce) repository.

### Environment variables

Make sure you have a `.env` file. You can look at `.env.example` for inspiration. `.env` file must contain the following environment variables

- COMMERCE_API_CLIENT_ID
- COMMERCE_API_ORG_ID
- COMMERCE_API_SHORT_CODE
- COMMERCE_API_SITE_ID
- COMMERCE_API_DEFAULT_SITE
- SCAPI_URL
- OCAPI_URL
- SFCC_HOST
- PWA_KIT_SLAS_CLIENT_SECRET

To handle MarketPay's webhook/callback requests (see [MarketPay Webhook Callbacks](#marketpay-webhook-callbacks) below), also set:

- ADMIN_CLIENT_ID_PRIVATE
- ADMIN_CLIENT_SECRET
- SFCC_REALM_AND_INSTANCE
- SFCC_OAUTH_SCOPES
- MARKETPAY_DEFAULT_ERROR_URL
- MARKETPAY_KNOWN_IP_PROTECTION
- MARKETPAY_ALLOWED_IPS (optional)
- MARKETPAY_SIGNATURE_PROTECTION
- MARKETPAY_CALLBACK_SECRET
- MARKETPAY_TRUSTED_PROXY_HOPS (required on deployments behind a proxy/CDN, see below)

### Run the app

To start your web server for local development:

- Navigate to the app directory:

    ```bash
    cd packages/marketpay-retail-react-app
    ```

- Run the following command:

    ```bash
    npm start
    ```

    Now that the development server is running, you can open a browser and preview your commerce app:

    Go to http://localhost:3000/

## MarketPay Webhook Callbacks

This app registers the server-side routes that MarketPay calls back to directly: payment notifications, success/failure redirects, and the hosted payment form's styling page.

| Route | Purpose |
|-------|---------|
| `POST /webhooks/marketpay/payment-notification` | Server-to-server payment status notifications from MarketPay. |
| `POST /webhooks/marketpay/payment-success` | Browser/app redirect after a successful payment; forwards to SCAPI, then redirects the shopper. |
| `POST /webhooks/marketpay/payment-failed` | Browser/app redirect after a failed payment; forwards to SCAPI, then redirects the shopper. |
| `POST /marketpay/callback-form` | Renders the styling page for MarketPay's hosted payment form. |

Env vars used for this:

| Variable | Description |
|----------|-------------|
| `COMMERCE_API_SHORT_CODE` / `COMMERCE_API_ORG_ID` / `COMMERCE_API_SITE_ID` | Used to build the SCAPI custom endpoint URL the callbacks are forwarded to. |
| `ADMIN_CLIENT_ID_PRIVATE` / `ADMIN_CLIENT_SECRET` | Account Manager API client credentials, used to get the token this app presents to SCAPI when forwarding MarketPay webhooks. The client needs the `c_marketpaycallbacks_rw` scope. |
| `SFCC_REALM_AND_INSTANCE` | Realm and instance the token is issued for, e.g. `bknt_005`. |
| `SFCC_OAUTH_SCOPES` | Space-separated scopes requested for that token, e.g. `c_marketpaycallbacks_rw sfcc.custom-apis`. |
| `MARKETPAY_DEFAULT_ERROR_URL` | Fallback redirect if a callback can't be processed (missing/invalid signature, SCAPI unreachable, order not found, etc.). |
| `MARKETPAY_KNOWN_IP_PROTECTION` | Restricts `/webhooks/marketpay/*` to MarketPay's known IP ranges. Defaults to `true`; set to `"false"` to disable (e.g. behind a firewall/proxy that obscures the real caller IP). |
| `MARKETPAY_ALLOWED_IPS` | Optional comma-separated list of IPs/CIDR ranges, overriding the built-in default allowlist. |
| `MARKETPAY_SIGNATURE_PROTECTION` | Verifies that incoming callbacks on `/webhooks/marketpay/*` are genuinely from MarketPay. Defaults to `true`; set to `"false"` to disable. When enabled, `MARKETPAY_CALLBACK_SECRET` must also be set, or every callback is rejected. |
| `MARKETPAY_CALLBACK_SECRET` | Shared secret used to verify that incoming callbacks are genuinely from MarketPay. Must match the secret configured on the MarketPay side — see [Callback Security setup](https://documentation.altapay.com/v2/Checkout-API/CallbackSecurity/). |
| `MARKETPAY_TRUSTED_PROXY_HOPS` | Number of trusted proxies (CDN, load balancer) in front of this app, used to resolve the real caller IP for `MARKETPAY_KNOWN_IP_PROTECTION`. Must match your proxy chain exactly. Leave unset when there is no proxy (e.g. local development). Apps using `marketpay-salesforce-pwa` must set `trust proxy` themselves, as `ssr.js` does here. |

On the SFCC side, the `int_marketpay_headless` cartridge's **MRT Base URL for Callbacks** site preference (`marketPayCallbackBaseURL`) must point at this app's deployed origin so MarketPay's callback URLs resolve here.

### Using the module in your own app

Requirements:

- Node.js 18 or above
- React 18 (peer dependency)
- The [`int_marketpay_headless` cartridge `3.0.0`](https://github.com/AltaPay/plugin-salesforce/releases/tag/3.0.0) or above, installed and configured in your SFCC environment
- An Account Manager API client with the `c_marketpaycallbacks_rw` scope

Install the package:

```bash
npm install marketpay-salesforce-pwa
```

Then add this to your `ssr.js`:

```js
import express from 'express'
import {registerMarketPayCallbacks} from 'marketpay-salesforce-pwa/dist/ssr/index.js'

const {handler} = runtime.createHandler(options, (app) => {
    // Real caller IP behind proxies (known IP protection)
    const hops = parseInt(process.env.MARKETPAY_TRUSTED_PROXY_HOPS, 10)
    if (Number.isInteger(hops) && hops > 0) app.set('trust proxy', hops)

    // Raw webhook body for signature verification, before any other body parser
    const rawBody = (req, res, buf) => (req.rawBody = buf.toString('utf8'))
    app.use('/webhooks/marketpay', express.json({verify: rawBody}), express.urlencoded({extended: true, verify: rawBody}))
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    registerMarketPayCallbacks(app, runtime)
})
```

Without the raw body capture, every callback is rejected with `Missing request body`.

Client-side helpers and hooks are imported from the package root:

```js
import {isMarketPayMethod, useMarketPayPayment} from 'marketpay-salesforce-pwa'
```

The package ships two builds:

| Import | Built from | Used by |
|--------|------------|---------|
| `marketpay-salesforce-pwa` (`dist/app/index.js`) | `lib/index.js` | Storefront |
| `marketpay-salesforce-pwa/dist/ssr/index.js` | `lib/api/index.js` | `ssr.js` (Node) |

To build the package from source, run `npm run build` (production) or `npm run build-dev` in `packages/marketpay-salesforce-pwa`.

## Changelog

See [Changelog](CHANGELOG.md) for all the release notes.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.