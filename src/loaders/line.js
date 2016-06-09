import DataLoader from 'dataloader';
import r from '../db';

const loader = new DataLoader(keys =>
    r.expr(keys).map(key =>
        r.table('stations').filter(row =>
            row('lines').contains(key)
        ).orderBy('location').coerceTo('array')
    ).run()
);

r.table('stations').changes().then(feed => {
    const getNext = () =>
        feed.next()
            .then(({old_val, new_val}) => {
                if (old_val) {
                    old_val.lines.forEach(loader.clear.bind(loader));
                }

                if (new_val) {
                    new_val.lines.forEach(loader.clear.bind(loader));
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

export default loader;
