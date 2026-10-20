/**
 * Logger for MarketPay's server-side integration.
 */

const PREFIX = '[MarketPay]'

function format(message, meta) {
    return meta && Object.keys(meta).length > 0
        ? `${PREFIX} ${message} ${JSON.stringify(meta)}`
        : `${PREFIX} ${message}`
}

export const logger = {
    info(message, meta) {
        console.log(format(message, meta))
    },
    warn(message, meta) {
        console.warn(format(message, meta))
    },
    error(message, meta) {
        console.error(format(message, meta))
    }
}
