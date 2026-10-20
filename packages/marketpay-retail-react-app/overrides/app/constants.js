/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
    Hello there! This is a demonstration of how to override a file from the base template.

    It's necessary that the module export interface remain consistent,
    as other files in the base template rely on constants.js, thus we
    import the underlying constants.js, modifies it and re-export it.
*/

export const CUSTOM_HOME_TITLE = '🎉 Hello Extensible React Template!'

export const SHIPPING_COUNTRY_CODES = [
    {value: 'AL', label: 'Albania'},
    {value: 'AD', label: 'Andorra'},
    {value: 'AT', label: 'Austria'},
    {value: 'BY', label: 'Belarus'},
    {value: 'BE', label: 'Belgium'},
    {value: 'BA', label: 'Bosnia and Herzegovina'},
    {value: 'BG', label: 'Bulgaria'},
    {value: 'HR', label: 'Croatia'},
    {value: 'CY', label: 'Cyprus'},
    {value: 'CZ', label: 'Czech Republic'},
    {value: 'DK', label: 'Denmark'},
    {value: 'EE', label: 'Estonia'},
    {value: 'FI', label: 'Finland'},
    {value: 'FR', label: 'France'},
    {value: 'DE', label: 'Germany'},
    {value: 'GR', label: 'Greece'},
    {value: 'HU', label: 'Hungary'},
    {value: 'IS', label: 'Iceland'},
    {value: 'IE', label: 'Ireland'},
    {value: 'IT', label: 'Italy'},
    {value: 'LV', label: 'Latvia'},
    {value: 'LI', label: 'Liechtenstein'},
    {value: 'LT', label: 'Lithuania'},
    {value: 'LU', label: 'Luxembourg'},
    {value: 'MT', label: 'Malta'},
    {value: 'MD', label: 'Moldova'},
    {value: 'MC', label: 'Monaco'},
    {value: 'ME', label: 'Montenegro'},
    {value: 'NL', label: 'Netherlands'},
    {value: 'MK', label: 'North Macedonia'},
    {value: 'NO', label: 'Norway'},
    {value: 'PL', label: 'Poland'},
    {value: 'PT', label: 'Portugal'},
    {value: 'RO', label: 'Romania'},
    {value: 'RU', label: 'Russia'},
    {value: 'SM', label: 'San Marino'},
    {value: 'RS', label: 'Serbia'},
    {value: 'SK', label: 'Slovakia'},
    {value: 'SI', label: 'Slovenia'},
    {value: 'ES', label: 'Spain'},
    {value: 'SE', label: 'Sweden'},
    {value: 'CH', label: 'Switzerland'},
    {value: 'UA', label: 'Ukraine'},
    {value: 'GB', label: 'United Kingdom'},
    {value: 'VA', label: 'Vatican City'},
    {value: 'CA', label: 'Canada'},
    {value: 'US', label: 'United States'}
]

export * from '@salesforce/retail-react-app/app/constants'
