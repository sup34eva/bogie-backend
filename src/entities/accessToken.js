import {
    Schema
} from 'mongoose';
import db from './db';

export const schema = new Schema({
    user: Schema.Types.ObjectId,
    client: Schema.Types.ObjectId,
    scope: String
});

export default db.model('AccessToken', schema);
