import DataLoader from 'dataloader';
import User from '../entities/user';

export default new DataLoader(keys =>
    User.find({
        _id: {
            $in: keys
        }
    }).exec().then(result =>
        keys.map(key =>
            result.find(({_id}) => _id.equals(key))
        )
    )
);
