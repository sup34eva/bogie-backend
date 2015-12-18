import {
    Schema
} from 'mongoose';
import db from './db';

export const schema = new Schema({
    name: String
});

export default db.model('Station', schema);
