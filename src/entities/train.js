import {
    Schema
} from 'mongoose';
import db from './db';

export const schema = new Schema({
    departure: Schema.Types.ObjectId,
    arrival: Schema.Types.ObjectId,
    date: Date
});

export default db.model('Train', schema);
