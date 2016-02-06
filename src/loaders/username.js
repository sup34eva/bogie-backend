import DataLoader from 'dataloader';
import User from '../entities/user';

export default new DataLoader(keys =>
    User.find({
        username: {
            $in: keys
        }
    }).exec().then(result =>
        keys.map(key =>
            result.find(({username}) => username === key) || new Error(`User not found: ${key}`)
        )
    )
);
