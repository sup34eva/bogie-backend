import DataLoader from 'dataloader';
import r from '../db';

const loader = new DataLoader(keys =>
    r.expr(keys).map(key =>
        r.table('links').getAll(key, {index: 'edges'}).coerceTo('array')
    )
);

r.table('links').changes().run().then(feed => {
    feed.each((err, {old_val}) => {
        if (err) {
            return console.error(err);
        }

        if (old_val) {
            old_val.edges.forEach(loader.clear);
        }
    });
}).catch(err => {
    console.error(err);
});

r.table('stations').map(station => ({
    key: station('name'),
    value: r.table('links').getAll(station('name'), {index: 'edges'}).coerceTo('array')
})).then(data => {
    data.forEach(({key, value}) => {
        loader.prime(key, value);
    });

    console.log('Loaded graph cache data');
});

export default loader;
