import DataLoader from 'dataloader';
import r from '../db';

const loader = new DataLoader(keys =>
    r.expr(keys).map(key =>
        r.table('stations').filter(row =>
            row('lines').contains(key)
        ).orderBy('location').coerceTo('array')
    ).run()
);

r.table('stations').changes().run().then(feed => {
    feed.each((err, {old_val, new_val}) => {
        if (err) {
            return console.error(err);
        }

        if (old_val) {
            old_val.lines.forEach(loader.clear.bind(loader));
        }

        if(new_val) {
            new_val.lines.forEach(loader.clear.bind(loader));
        }
    });
}).catch(err => {
    console.error(err);
});

export default loader;
