/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Provide the sites for your app. Each site includes site id, and its localization configuration.
// You can also provide aliases for your locale. They will be used in place of your locale id when generating paths across the app
module.exports = [
    {
        id: process.env.SITE_ID || 'RefArchGlobal',
        l10n: {
            supportedCurrencies: [process.env.SUPPORTED_CURRENCIES || 'EUR'],
            defaultCurrency: process.env.DEFAULT_CURRENCY || 'EUR',
            defaultLocale: process.env.DEFAULT_LOCALE || 'en-GB',
            supportedLocales: [
                {
                    id: process.env.DEFAULT_LOCALE || 'en-GB',
                    preferredCurrency: process.env.DEFAULT_CURRENCY || 'EUR'
                }
            ]
        }
    }
]
