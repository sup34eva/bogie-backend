import paypal from 'paypal-rest-sdk';

paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_ID,
    client_secret: process.env.PAYPAL_SECRET
});

export function createPayment(payment) {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, (error, payment) => {
            if (error) {
                return reject(error);
            }

            resolve(payment);
        });
    });
}

export function executePayment(paymentId, details) {
    return new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, details, (error, payment) => {
            if (error) {
                return reject(error);
            }

            resolve(payment);
        });
    });
}
