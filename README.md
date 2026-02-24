# AltaPay for Salesforce B2C Composable Storefront PWA

This repository contains the MarketPay reference react application, which can be used to demonstrate the payment flow or to support the integration of AltaPay via the Salesforce cartridge for Salesforce B2C Commerce (SFCC).


## Setting Up and Running the App

### Prerequisites

Make sure the `int_marketpay_headless` cartridge is installed and configured in your SFCC environment from the [plugin-salesforce](https://github.com/AltaPay/plugin-salesforce) repository.

### Environment variables

1. Make sure you have a `.env` file. You can look at `.env.example` for inspiration. `.env` file must contain the following environment variables

- COMMERCE_API_CLIENT_ID
- COMMERCE_API_ORG_ID
- COMMERCE_API_SHORT_CODE
- COMMERCE_API_SITE_ID
- COMMERCE_API_DEFAULT_SITE
- SCAPI_URL
- OCAPI_URL
- SFCC_HOST

### Run the app

To start your web server for local development:

- Navigate to the app directory:

        cd packages/marketpay-retail-react-app

- Run the following command:

        npm start

    Now that the development server is running, you can open a browser and preview your commerce app:

    Go to http://localhost:3000/

## Changelog

See [Changelog](CHANGELOG.md) for all the release notes.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.