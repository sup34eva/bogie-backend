import DataLoader from 'dataloader';
import r from '../db';
import userLoader from './user';

export default new DataLoader(keys =>
    userLoader.loadMany(keys.map(key => r.uuid(key)))
);
