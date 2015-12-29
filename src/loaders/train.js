import DataLoader from 'dataloader';
import Train from '../entities/train';

import {
    sortResult
} from '../utils/loaderHelpers';

export default new DataLoader(keys =>
    Train.find({
        _id: {
            $in: keys
        }
    }).exec().then(sortResult(keys, 'Train'))
);
