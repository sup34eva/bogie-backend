import {
    hash,
    compare
} from 'bcrypt-nodejs';

export function hashAsync(data, salt, progress) {
    return new Promise((resolve, reject) => {
        hash(data, salt, progress, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export function compareAsync(data, encrypted) {
    return new Promise((resolve, reject) => {
        compare(data, encrypted, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}
