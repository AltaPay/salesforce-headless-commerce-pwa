/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Redirect, useLocation, useParams} from 'react-router-dom'

const CheckoutConfirmationRedirect = () => {
    const location = useLocation()
    const {locale} = useParams()
    const orderID = new URLSearchParams(location.search).get('orderID')

    if (!orderID) {
        return <Redirect to="/" />
    }

    const localePrefix = locale ? `/${locale}` : ''
    return <Redirect to={`${localePrefix}/checkout/confirmation/${orderID}`} />
}

export default CheckoutConfirmationRedirect
