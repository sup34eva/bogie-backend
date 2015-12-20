import {
    Schema
} from 'mongoose';
import db from './db';

export const schema = new Schema({
    secret: String
});

export default db.model('Client', schema);
