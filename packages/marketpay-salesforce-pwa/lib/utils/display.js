import {MARKETPAY_PREFIX} from './constants'

/**
 * Convert a MarketPay payment method ID into a human-readable display name.
 * E.g. `MARKETPAY_GOOGLE_PAY` -> `GOOGLE PAY`
 * @param {string} paymentMethodId
 * @returns {string}
 */
export const getMarketPayDisplayName = (paymentMethodId) => {
    if (!paymentMethodId) return ''
    return paymentMethodId.replace(MARKETPAY_PREFIX, '').replace(/_/g, ' ')
}
