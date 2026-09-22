import {config} from './config.js'

let cachedAdminToken = null
let adminTokenExpiry = 0

/**
 * Requests an Account Manager (Business Manager) admin OAuth token via the
 * `client_credentials` grant, caching it until shortly before it expires.
 *
 * Requires an Account Manager API client (ADMIN_CLIENT_ID_PRIVATE /
 * ADMIN_CLIENT_SECRET) granted the SALESFORCE_COMMERCE_API scope for
 * SFCC_REALM_AND_INSTANCE.
 */
async function getAdminAccessToken() {
    if (cachedAdminToken && Date.now() < adminTokenExpiry) {
        return cachedAdminToken
    }

    const {adminClientId, adminClientSecret} = config
    if (!adminClientId || !adminClientSecret) {
        throw new Error(
            'ADMIN_CLIENT_ID_PRIVATE / ADMIN_CLIENT_SECRET are not configured'
        )
    }

    const basicAuth = Buffer.from(`${adminClientId}:${adminClientSecret}`).toString('base64')
    const scope = `SALESFORCE_COMMERCE_API:${config.sfccRealmAndInstance} ${config.sfccOAuthScopes}`

    const response = await fetch(config.adminTokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authorization: `Basic ${basicAuth}`
        },
        body: new URLSearchParams({scope})
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`${response.status} ${response.statusText}`, {cause: error})
    }

    const {access_token: accessToken, expires_in: expiresIn} = await response.json()
    cachedAdminToken = accessToken
    adminTokenExpiry = Date.now() + (expiresIn - 60) * 1000

    return cachedAdminToken
}

/**
 * Forwards the raw webhook payload to a SCAPI custom
 * endpoint (marketpay/v1/organizations/{organizationId}/{endpoint}).
 */
export async function forwardToSCAPI(req, endpoint) {
    const accessToken = await getAdminAccessToken()
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
