import DataLoader from 'dataloader';
import r from '../db';

const loader = new DataLoader(keys =>
    r.expr(keys).map(key =>
        r.table('links').getAll(key, {index: 'edges'}).coerceTo('array')
    )
);

r.table('links').changes().run().then(feed => {
    const getNext = () =>
        feed.next()
            .then(({old_val, new_val}) => {
                if (old_val) {
                    old_val.edges.forEach(loader.clear.bind(loader));
                }

                if (new_val) {
                    new_val.edges.forEach(loader.clear.bind(loader));
                }
            })
            .then(getNext)
            .catch(err => {
                console.error(err);
            });

    return getNext();
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
