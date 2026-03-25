import {MARKETPAY_PREFIX, CREDIT_CARD_METHOD} from './constants'

/**
 * Check if a payment method ID belongs to MarketPay.
 * @param {string} methodId - The payment method identifier
 * @returns {boolean}
 */
export const isMarketPayMethod = (methodId) => {
    return methodId?.startsWith(MARKETPAY_PREFIX)
}

/**
 * Check if a payment method requires the credit card form fields.
 * Only the standard CREDIT_CARD method needs form input; MarketPay methods do not.
 * @param {string} methodId
 * @returns {boolean}
 */
export const requiresCreditCardForm = (methodId) => {
    return methodId === CREDIT_CARD_METHOD
}

/**
 * Select the default payment method from a list.
 * Prefers the first MarketPay method; falls back to the first method overall.
 * @param {Array} paymentMethods - Array of payment method objects with `id` property
 * @returns {object|undefined} The selected payment method, or undefined if list is empty
 */
export const findDefaultPaymentMethod = (paymentMethods) => {
    if (!paymentMethods || paymentMethods.length === 0) return undefined
    const marketPayMethod = paymentMethods.find((m) => isMarketPayMethod(m.id))
    return marketPayMethod || paymentMethods[0]
}
