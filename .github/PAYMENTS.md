# Payment integration

The `/payment/` page uses the T-Bank widget, as in the reference repository
https://github.com/3x6th/landing-mentor. Card details are entered on the bank's
payment page. A terminal password is never needed or stored in this repository.

`payment/config.js` contains the public production TerminalKey copied from the
merchant's T-Bank dashboard. Payments use the production terminal.

## Before accepting real payments

- Checks T-Business is connected. Production requests must include Receipt;
  otherwise the terminal rejects Init with error 309 / expected.receipt.
- The merchant confirmed USN Income (`usn_income`), no VAT (`none`) and the seller
  email `vlad.yurin98@gmail.com`. These settings are now in `payment/config.js`.
  The code constructs receipt item prices and totals in integer kopecks.
  `receiptRequired` prevents sending a request if fiscal configuration is missing.
- The dashboard marked tests 1, 2, 3, 7 and 8 as passed on the DEMO terminal.
  Receipt tests used merchant-authorized dummy tax settings in a separate local
  copy. Production settings were subsequently confirmed separately by the merchant.
- Confirm payments in the bank's dashboard. A browser redirect does not prove
  that a payment succeeded. This site does not automatically provision services.

The amount is intentionally entered by the customer, from 1 to 300,000 RUB.
The upper limit matches the store's displayed single-operation limit at setup.
The bank may apply additional restrictions.

The Pages workflow deploys pushes to `main`. Repository Actions are restricted
to the official action versions used by that workflow and its upload dependency.
