import DataLoader from 'dataloader';
import Station from '../entities/station';

export default new DataLoader(keys =>
    Station.find({
        _id: {
            $in: keys
        }
    }).exec().then(result =>
        keys.map(key =>
            result.find(({_id}) => _id.equals(key))
        )
    )
);
