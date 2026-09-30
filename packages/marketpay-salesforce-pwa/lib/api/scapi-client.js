import {config} from './config.js'

let cachedShopperToken = null
let shopperTokenExpiry = 0

/**
 * Requests a guest shopper token from SLAS via the `client_credentials` grant
 * of the private SLAS client, caching it until shortly before it expires.
 *
 * Requires a private SLAS client (COMMERCE_API_CLIENT_ID /
 * PWA_KIT_SLAS_CLIENT_SECRET) whose scopes include the custom API's scope and
 * whose channels include COMMERCE_API_SITE_ID.
 */
async function getShopperAccessToken() {
    if (cachedShopperToken && Date.now() < shopperTokenExpiry) {
        return cachedShopperToken
    }

    const {slasClientId, slasClientSecret} = config
    if (!slasClientId || !slasClientSecret) {
        throw new Error('COMMERCE_API_CLIENT_ID / PWA_KIT_SLAS_CLIENT_SECRET are not configured')
    }

    const basicAuth = Buffer.from(`${slasClientId}:${slasClientSecret}`).toString('base64')
    const tokenUrl = `https://${config.commerceApiShortCode}.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/${config.commerceApiOrgId}/oauth2/token`

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authorization: `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            channel_id: config.commerceApiSiteId
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`${response.status} ${response.statusText}`, {cause: error})
    }

    const {access_token: accessToken, expires_in: expiresIn} = await response.json()
    cachedShopperToken = accessToken
    shopperTokenExpiry = Date.now() + (expiresIn - 60) * 1000

    return cachedShopperToken
}

/**
 * Forwards the raw webhook payload to a SCAPI custom
 * endpoint (marketpay/v1/organizations/{organizationId}/{endpoint}).
 */
export async function forwardToSCAPI(req, endpoint) {
    const accessToken = await getShopperAccessToken()
    const url = `https://${config.commerceApiShortCode}.api.commercecloud.salesforce.com/custom/marketpay/v1/organizations/${config.commerceApiOrgId}/${endpoint}?siteId=${config.commerceApiSiteId}`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(req.body)
    })

    const text = await response.text()

    if (!response.ok) {
        let detail = text
        let redirectUrl
        try {
            const body = JSON.parse(text)
            detail = body.detail || text
            redirectUrl = body.redirectUrl
        } catch {
            // Non-JSON error body - fall back to the raw text.
        }
        const error = new Error(detail || `${response.status} ${response.statusText}`)
        error.status = response.status
        error.redirectUrl = redirectUrl
        throw error
    }

    // The SCAPI notification endpoint renders an empty body (no JSON) on
    // success via RESTResponseMgr.createEmptySuccess - only parse a body
    // when one was actually sent.
    return text ? JSON.parse(text) : null
}
