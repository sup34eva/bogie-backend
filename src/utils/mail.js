import {
    Mailgun
} from 'mailgun';

const mg = new Mailgun(process.env.MAILGUN_KEY);

export function sendMail(recipients, subject, text) {
    return new Promise((resolve, reject) => {
        mg.sendText('noreply@bogie.leops.me', recipients, subject, text, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
