"use strict";

// Parse rubles as integer kopecks, including comma decimals, without floating-point rounding.
function parsePaymentAmount(value) {
    const normalized = value.trim().replace(/[ \u00a0\u202f]/g, "").replace(",", ".");
    if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(normalized)) return null;
    const [rubles, fraction = ""] = normalized.split(".");
    const kopecks = Number(rubles) * 100 + Number(fraction.padEnd(2, "0"));
    return kopecks >= 100 && kopecks <= 30000000 ? kopecks : null;
}

const form = document.getElementById("payment-form");
const message = document.getElementById("payment-message");
const button = form.querySelector('button[type="submit"]');
const config = window.paymentConfig;
const offerPaths = Object.freeze({
    consultation: "/offer/",
    "contract-from-zero": "/contract-from-zero/",
    "contract-gradeup": "/contract-gradeup/"
});
const selectedOfferLink = document.getElementById("selected-offer");
const requestedService = new URLSearchParams(window.location.search).get("service");
if (Object.hasOwn(offerPaths, requestedService)) form.elements.service.value = requestedService;
function updateSelectedOffer() {
    selectedOfferLink.href = `..${offerPaths[form.elements.service.value] || offerPaths.consultation}`;
    const descriptions = {
        consultation: "Консультация в области IT",
        "contract-from-zero": "Сопровождение с нуля",
        "contract-gradeup": "Повышение грейда"
    };
    form.elements.description.value = descriptions[form.elements.service.value] || descriptions.consultation;
    form.elements.acceptOffer.checked = false;
}
form.elements.service.addEventListener("change", updateSelectedOffer);
updateSelectedOffer();

form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";
    if (!form.reportValidity()) return;
    const service = form.elements.service.value;
    if (!Object.hasOwn(offerPaths, service) || !form.elements.acceptOffer.checked) {
        message.textContent = "Выберите услугу и подтвердите ознакомление с офертой.";
        return;
    }
    const amount = parsePaymentAmount(form.elements.amount.value);
    if (amount === null) {
        message.textContent = "Укажите сумму от 1 до 300 000 ₽, не более двух знаков после запятой.";
        form.elements.amount.focus();
        return;
    }
    if (!config?.terminalKey) {
        message.textContent = "Онлайн-оплата пока настраивается. Пожалуйста, напишите мне для оплаты.";
        return;
    }
    if (config.receiptRequired && (!config.receipt?.emailCompany || !config.receipt?.taxation || !config.receipt?.tax)) {
        message.textContent = "Онлайн-оплата временно недоступна. Пожалуйста, напишите мне для оплаты.";
        return;
    }
    if (typeof window.doPay !== "function") {
        message.textContent = "Не удалось загрузить форму Т‑Банка. Обновите страницу и попробуйте ещё раз.";
        return;
    }
    const description = form.elements.description.value.trim();
    const name = form.elements.payerName.value.trim();
    if (!description || !name) {
        message.textContent = "Заполните ФИО и назначение платежа.";
        return;
    }
    const email = form.elements.email.value.trim();
    const payment = {
        TerminalKey: config.terminalKey,
        Amount: amount,
        OrderId: `yurin-${crypto.randomUUID()}`,
        Description: description,
        Frame: false,
        Language: "ru",
        Email: email,
        DATA: {
            Email: email,
            Name: name,
            Service: service,
            Offer: `https://yurin.tech${offerPaths[service]}`,
            OfferVersion: "2026-10-20",
            OfferAccepted: "true"
        }
    };
    if (config.receipt) {
        payment.Receipt = {
            Email: email,
            EmailCompany: config.receipt.emailCompany,
            Taxation: config.receipt.taxation,
            Items: [{
                Name: description,
                Price: amount,
                Quantity: 1,
                Amount: amount,
                PaymentMethod: "full_payment",
                PaymentObject: "service",
                Tax: config.receipt.tax
            }]
        };
    }
    button.disabled = true;
    button.textContent = "Открываем Т‑Банк…";
    try {
        window.doPay(payment);
    } catch {
        message.textContent = "Не удалось открыть оплату. Попробуйте ещё раз или напишите мне.";
    } finally {
        // The bank widget reports its own asynchronous errors. Allow a retry if no redirect occurs.
        window.setTimeout(() => {
            button.disabled = false;
            button.textContent = "Перейти к оплате";
        }, 8000);
    }
});
