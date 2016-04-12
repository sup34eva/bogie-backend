import DataLoader from 'dataloader';
import r from '../db';

const loader = new DataLoader(keys =>
    r.expr(keys).map(key => r.table('clients').get(key))
);

r.table('clients').changes().run().then(feed => {
    feed.each((err, {old_val}) => {
        if (err) {
            return console.error(err);
        }

        if (old_val) {
            loader.clear(old_val.id);
        }
    });
}).catch(err => {
    console.error(err);
});

export default loader;
