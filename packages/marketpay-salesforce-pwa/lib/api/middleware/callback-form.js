/**
 * Renders the AltaPay terminal.js hosted card-capture form.
 * a bare page containing an empty
 * `<form id="PensioPaymentForm">` that AltaPay's terminal.js (loaded inside
 * an iframe pointed at this URL) populates with the actual card fields.
 * `language` and `form_template` are posted by terminal.js itself when it
 * initializes the iframe.
 */

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;'
            case '<':
                return '&lt;'
            case '>':
                return '&gt;'
            case '"':
                return '&quot;'
            default:
                return '&#39;'
        }
    })
}

/**
 * Handles the MarketPay callback-form request.
 */
export function callbackFormHandler(req, res) {
    const languageCode = escapeHtml(req.body.language)
    const formTemplateClass = escapeHtml(req.body.form_template)

    const html = `<!DOCTYPE html>
<html lang="${languageCode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Payment</title>
  <style>
    .content-wrapper {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px 50px;
    }
    .pensio_payment_form_row {
      margin-top: 20px;
    }
    .pensio_payment_form_input_cell select {
      width: 40%;
      padding: 5px 0;
    }
    .custom-label {
      font-size: 13px;
    }
    input[type="text"],
    input[type="tel"],
    select {
      border-width: 0 0 1px;
      border-color: #000;
      padding-inline: 0;
    }
    input[type="text"]:focus-visible,
    input[type="tel"]:focus-visible,
    select:focus-visible {
      outline: none;
    }
    .pensio_payment_form_cardholder {
      margin-top: 20px;
    }
  </style>
</head>
<body class="${formTemplateClass}">
  <div class="content-wrapper">
    <div class="payment-form-wrapper">
      <form id="PensioPaymentForm">
        <!-- All content in here will be replaced by the actual payment form -->
      </form>
    </div>
  </div>
</body>
</html>`

    res.status(200).type('html').send(html)
}
