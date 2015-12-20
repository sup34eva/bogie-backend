import {
    Schema
} from 'mongoose';
import db from './db';

export const schema = new Schema({
    password: String
});

export default db.model('User', schema);
