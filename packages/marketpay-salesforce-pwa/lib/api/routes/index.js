import {
    validateSignature,
    validateKnownIP,
    paymentNotificationHandler,
    paymentSuccessHandler,
    paymentFailedHandler
} from '../middleware/webhook.js'
import {callbackFormHandler} from '../middleware/callback-form.js'

/**
 * Registers MarketPay's server-side callbacks on the Express app.
 *
 * @param app - express app used to register the routes
 * @param runtime - express runtime (unused today, accepted for parity with other integrations)
 * @param overrides (optional) - override the default handler chain for an endpoint
 *
 */
export function registerMarketPayCallbacks(app, runtime, overrides = {}) {

    const notificationHandler = overrides.notification || [
        validateKnownIP,
        paymentNotificationHandler
    ]

    const paymentSuccessChain = overrides.paymentSuccess || [
        validateKnownIP,
        paymentSuccessHandler
    ]

    const paymentFailedChain = overrides.paymentFailed || [
        validateKnownIP,
        paymentFailedHandler
    ]

    // Not gated by validateKnownIP: unlike the webhook endpoints above, this
    // is loaded client-side (in an iframe) by AltaPay's terminal.js running
    // in the shopper's own browser, not called server-to-server by AltaPay.
    const callbackFormChain = overrides.callbackForm || [callbackFormHandler]

    app.post('/webhooks/marketpay/payment-notification', ...notificationHandler)
    app.post('/webhooks/marketpay/payment-success', ...paymentSuccessChain)
    app.post('/webhooks/marketpay/payment-failed', ...paymentFailedChain)
    app.post('/marketpay/callback-form', ...callbackFormChain)
}
