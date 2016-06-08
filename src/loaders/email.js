import DataLoader from 'dataloader';
import r from '../db';
import userLoader from './user';

const loadUsers = userLoader.loadMany.bind(userLoader);
const loader = new DataLoader(keys =>
    r.expr(keys).map(key => r.uuid(key)).then(loadUsers)
);

r.table('users').changes().run().then(feed => {
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
