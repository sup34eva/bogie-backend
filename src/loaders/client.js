import DataLoader from 'dataloader';
import Client from '../entities/client';

export default new DataLoader(keys =>
    Client.find({
        _id: {
            $in: keys
        }
    }).exec().then(result =>
        keys.map(key =>
            result.find(({_id}) => _id.equals(key))
        )
    )
);
