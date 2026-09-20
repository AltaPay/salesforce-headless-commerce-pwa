import crypto from 'crypto'
import {getClientIP, isRequestFromKnownIP} from '../../utils/ipHelpers.js'
import {logger} from '../../utils/logger.js'
import {forwardToSCAPI} from '../scapi-client.js'
import {config} from '../config.js'

const SIGNATURE_HEADER = 'altapay-signature'

/**
 * Parses the `AltaPay-Signature` header into its timestamp and signature parts.
 * Expected format: `t=<timestamp>;s0=<hexHmac>;s1=<hexHmac>...`
 */
function parseSignatureHeader(headerValue) {
    let timestamp = null
    const signatures = []

    headerValue.split(';').forEach((field) => {
        const trimmed = field.trim()
        if (trimmed.startsWith('t=')) {
            timestamp = trimmed.slice(2)
        } else if (/^s\d+=/.test(trimmed)) {
            signatures.push(trimmed.split('=')[1])
        }
    })

    return {timestamp, signatures}
}

function safeHexEqual(a, b) {
    const bufA = Buffer.from(a, 'hex')
    const bufB = Buffer.from(b, 'hex')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Validates IP address.
 */
export function validateKnownIP(req, res, next) {
    if (!config.isKnownIPProtectionEnabled) {
        return next()
    }

    if (!isRequestFromKnownIP(req, config.allowedIPs)) {
        logger.warn('Rejected MarketPay callback from unknown IP', {clientIP: getClientIP(req)})
        return res.status(400).json({message: 'Invalid callback request'})
    }

    return next()
}

/**
 * Responds to an invalid/unverifiable signature as JSON.
 */
export function sendSignatureErrorJson(res, {status, message}) {
    return res.status(status).json({message})
}

/**
 * Responds to an invalid/unverifiable signature by redirecting to the default error URL.
 */
export function redirectOnSignatureError(res) {
    return res.redirect(302, config.defaultErrorUrl)
}

/**
 * Validates the signature of the incoming request.
 */
export function validateSignature(onInvalid) {
    return function (req, res, next) {
        const secret = config.callbackSecret

        if (!secret) {
            return onInvalid(res, { status: 500, message: 'MarketPay callback secret is not configured' })
        }

        const signatureHeader = req.headers[SIGNATURE_HEADER]
        if (!signatureHeader) {
            return onInvalid(res, { status: 401, message: 'Invalid signature' })
        }

        const { timestamp, signatures } = parseSignatureHeader(signatureHeader)
        if (!timestamp || signatures.length === 0) {
            return onInvalid(res, { status: 401, message: 'Invalid signature' })
        }

        if (!req.rawBody) {
            return onInvalid(res, { status: 400, message: 'Missing request body' })
        }

        const payload = `${req.rawBody}.${timestamp}`
        const expectedHex = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex')

        const isValid = signatures.some((sig) => {
            try {
                return safeHexEqual(expectedHex, sig)
            } catch {
                return false
            }
        })

        if (!isValid) {
            logger.warn('Rejected MarketPay callback with invalid signature')
            return onInvalid(res, { status: 401, message: 'Invalid signature' })
        }

        return next()
    }
}

/**
 * Handles the MarketPay payment notification callback.
 */
export async function paymentNotificationHandler(req, res) {
    // Ignore new status
    if (req.body.status === 'new') {
        return res.status(200).json({message: 'Acknowledged'})
    }

    const orderID = req.body.shop_orderid
    if (!orderID) {
        return res.status(400).json({message: 'Error processing request'})
    }

    if (!req.body.xml) {
        return res.status(400).json({message: 'Order XML not found'})
    }

    try {
        await forwardToSCAPI(req, 'payment-notification')
    } catch (error) {
        logger.error('Failed to forward payment notification to SCAPI', {
            orderID,
            status: error.status,
            message: error.message
        })
        const status = error.status >= 400 && error.status < 500 ? error.status : 502
        return res.status(status).json({message: error.message || 'Failed to process notification'})
    }

    return res.status(200).json({message: 'Acknowledged'})
}

/**
 * Builds a handler for redirect callbacks (payment-success, payment-failed).
 */
function createRedirectHandler(scapiEndpoint) {
    return async function redirectHandler(req, res) {
        const orderID = req.body.shop_orderid
        if (!orderID) {
            return res.redirect(302, config.defaultErrorUrl)
        }

        if (!req.body.xml) {
            return res.redirect(302, config.defaultErrorUrl)
        }

        let scapiResponse
        try {
            scapiResponse = await forwardToSCAPI(req, scapiEndpoint)
        } catch (error) {
            logger.error(`Failed to forward ${scapiEndpoint} to SCAPI`, {
                orderID,
                status: error.status,
                message: error.message
            })
            return res.redirect(302, error.redirectUrl || config.defaultErrorUrl)
        }

        return res.redirect(302, scapiResponse?.redirectUrl || config.defaultErrorUrl)
    }
}

export const paymentSuccessHandler = createRedirectHandler('payment-success')
export const paymentFailedHandler = createRedirectHandler('payment-failed')
