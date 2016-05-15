import {
    hash,
    compare
} from 'bcrypt-nodejs';

import r from './db';

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

export async function findOrCreateUser(filter, insert) {
    try {
        const [user] = await r.table('users').filter(filter);
        return user.id;
    } catch (e) {
        const {inserted} = await r.table('users').insert(insert);

        if (inserted !== 1) {
            throw new Error('Could not create user');
        }

        return insert.id;
    }
}
