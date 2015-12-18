import DataLoader from 'dataloader';
import Train from '../entities/train';

export default new DataLoader(keys =>
    Train.find({
        _id: {
            $in: keys
        }
    }).exec().then(result =>
        keys.map(key =>
            result.find(({_id}) => _id.equals(key))
        )
    )
);
