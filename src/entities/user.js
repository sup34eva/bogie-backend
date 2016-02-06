import {
    Schema
} from 'mongoose';
import db from './db';

export const schema = new Schema({
    username: {
        type: String,
        index: {
            unique: true
        }
    },
    password: String,
    createdAt: Date
});

export default db.model('User', schema);
