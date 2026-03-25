import {ATTR_PAYMENT_URL, ATTR_PAYMENT_METHOD_ID, ATTR_MARKETPAY_DATA} from './constants'

/**
 * Build the payment instrument object to send to SCAPI for a MarketPay method.
 * @param {object} paymentMethod - The payment method object (from SCAPI applicablePaymentMethods)
 * @param {number} orderTotal - The basket order total
 * @returns {object} Payment instrument request body
 */
export const constructMarketPayPaymentInstrument = (paymentMethod, orderTotal) => {
    const marketPayData = paymentMethod?.[ATTR_MARKETPAY_DATA] || {}
    return {
        amount: orderTotal,
        paymentMethodId: paymentMethod.id,
        [ATTR_PAYMENT_METHOD_ID]: marketPayData.paymentMethod?.id || ''
    }
}

/**
 * Extract the MarketPay redirect URL from an order response.
 * @param {object} order - The order object returned by createOrder
 * @returns {string|undefined} The redirect URL, or undefined if not present
 */
export const extractRedirectUrl = (order) => {
    return order?.paymentInstruments?.[0]?.[ATTR_PAYMENT_URL]
}

/**
 * Check whether an order response requires a redirect to MarketPay.
 * @param {object} order - The order object returned by createOrder
 * @returns {boolean}
 */
export const shouldRedirectToMarketPay = (order) => {
    return !!extractRedirectUrl(order)
}
