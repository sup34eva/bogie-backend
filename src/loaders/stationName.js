import DataLoader from 'dataloader';
import r from '../db';
import stationLoader from './station';

const loader = new DataLoader(keys =>
    stationLoader.loadMany(keys.map(key => r.uuid(key)))
);

r.table('stations').changes().run().then(feed => {
    feed.each((err, {old_val, new_val}) => {
        if (err) {
            return console.error(err);
        }

        if (old_val) {
            loader.clear(old_val.name);
        }

        if(new_val) {
            loader.clear(new_val.name);
        }
    });
}).catch(err => {
    console.error(err);
});

export default loader;
