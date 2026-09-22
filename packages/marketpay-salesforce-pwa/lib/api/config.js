import {logger} from '../utils/logger.js'

const MARKETPAY_IP_ADDRESS_SET = ['185.206.120.0/24', '2a10:a200::/29', '185.203.232.129', '185.203.233.129'];
const ADMIN_TOKEN_URL = 'https://account.demandware.com/dwsso/oauth2/access_token?grant_type=client_credentials'

export const config = {
    adminTokenUrl: ADMIN_TOKEN_URL,
    get adminClientId() {
        return process.env.ADMIN_CLIENT_ID_PRIVATE
    },
    get adminClientSecret() {
        return process.env.ADMIN_CLIENT_SECRET
    },
    get sfccRealmAndInstance() {
        return process.env.SFCC_REALM_AND_INSTANCE
    },
    get sfccOAuthScopes() {
        return process.env.SFCC_OAUTH_SCOPES
    },
    get commerceApiShortCode() {
        return process.env.COMMERCE_API_SHORT_CODE
    },
    get commerceApiOrgId() {
        return process.env.COMMERCE_API_ORG_ID
    },
    get commerceApiSiteId() {
        return process.env.COMMERCE_API_SITE_ID
    },
    get defaultErrorUrl() {
        return process.env.MARKETPAY_DEFAULT_ERROR_URL
    },
    get isKnownIPProtectionEnabled() {
        return process.env.MARKETPAY_KNOWN_IP_PROTECTION !== 'false'
    },
    get isSignatureProtectionEnabled() {
        return process.env.MARKETPAY_SIGNATURE_PROTECTION !== 'false'
    },
    get allowedIPs() {
        return process.env.MARKETPAY_ALLOWED_IPS
            ? process.env.MARKETPAY_ALLOWED_IPS.split(',').map((entry) => entry.trim())
            : MARKETPAY_IP_ADDRESS_SET
    },
    get callbackSecret() {
        return process.env.MARKETPAY_CALLBACK_SECRET
    }
}

const REQUIRED_ENV_VARS = {
    adminClientId: 'ADMIN_CLIENT_ID_PRIVATE',
    adminClientSecret: 'ADMIN_CLIENT_SECRET',
    commerceApiShortCode: 'COMMERCE_API_SHORT_CODE',
    commerceApiOrgId: 'COMMERCE_API_ORG_ID',
    commerceApiSiteId: 'COMMERCE_API_SITE_ID',
    defaultErrorUrl: 'MARKETPAY_DEFAULT_ERROR_URL'
}

setImmediate(() => {
    const missingEnvVars = Object.entries(REQUIRED_ENV_VARS)
        .filter(([configKey]) => !config[configKey])
        .map(([, envVar]) => envVar)

    if (missingEnvVars.length > 0) {
        logger.error('MarketPay config is missing required environment variable(s)', {
            missing: missingEnvVars
        })
    }
})
