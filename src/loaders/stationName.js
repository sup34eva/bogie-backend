import DataLoader from 'dataloader';
import r from '../db';
import stationLoader from './station';

const loader = new DataLoader(keys =>
    stationLoader.loadMany(keys.map(key => r.uuid(key)))
);

r.table('stations').changes().run().then(feed => {
    const getNext = () =>
        feed.next()
            .then(({old_val, new_val}) => {
                if (old_val) {
                    loader.clear(old_val.name);
                }

                if(new_val) {
                    loader.clear(new_val.name);
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
