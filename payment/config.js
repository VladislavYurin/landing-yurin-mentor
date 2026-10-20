// Public widget settings only. Never put the terminal password here.
window.paymentConfig = Object.freeze({
    terminalKey: "1792483516607",
    receiptRequired: true,
    // Merchant-confirmed production settings for Checks T-Business.
    receipt: {
        emailCompany: "vlad.yurin98@gmail.com",
        taxation: "usn_income",
        tax: "none"
    }
});
