import DataLoader from 'dataloader';
import r from '../db';

export function autoCache(table, loader) {
    r.table(table).changes().then(feed => {
        const getNext = () =>
            feed.next()
                .then(({old_val, new_val}) => {
                    if (old_val) {
                        loader.clear(old_val.id);
                    }

                    if (new_val) {
                        loader.clear(new_val.id);
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

    return loader;
}

export function defaultLoader(table) {
    const getItem = key => r.table(table).get(key);
    return autoCache(table, new DataLoader(keys =>
        r.expr(keys).map(getItem)
    ));
}
