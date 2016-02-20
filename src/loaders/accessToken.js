import DataLoader from 'dataloader';
import r from '../db';

export default new DataLoader(keys =>
    r.expr(keys).map(key => r.table('accessTokens').get(key))
);
