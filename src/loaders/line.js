import DataLoader from 'dataloader';
import r from '../db';

export default new DataLoader(keys =>
    Promise.all(
        keys.map(key =>
            r.table('stations').filter(
                r.row('lines').contains(key)
            ).orderBy('location').run()
        )
    )
);
