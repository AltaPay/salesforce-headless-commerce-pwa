import {useState, useCallback} from 'react'
import {constructMarketPayPaymentInstrument} from '../utils/payment'

/**
 * Custom hook that encapsulates MarketPay payment submission logic.
 *
 * @param {object} options
 * @param {Function} options.addPaymentInstrumentToBasket - The SCAPI mutation function
 * @param {object} options.basket - The current basket object
 * @returns {{ submitMarketPayPayment: Function, isSubmitting: boolean }}
 */
export const useMarketPayPayment = ({addPaymentInstrumentToBasket, basket}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submitMarketPayPayment = useCallback(
        (paymentMethod) => {
            setIsSubmitting(true)
            const paymentInstrument = constructMarketPayPaymentInstrument(
                paymentMethod,
                basket?.orderTotal
            )
            return addPaymentInstrumentToBasket({
                parameters: {basketId: basket?.basketId},
                body: paymentInstrument
            }).then(
                (response) => {
                    setIsSubmitting(false)
                    return response
                },
                (error) => {
                    setIsSubmitting(false)
                    throw error
                }
            )
        },
        [addPaymentInstrumentToBasket, basket?.basketId, basket?.orderTotal]
    )

    return {submitMarketPayPayment, isSubmitting}
}
