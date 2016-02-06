import DataLoader from 'dataloader';
import User from '../entities/user';

import {
    sortResult
} from '../utils/loaderHelpers';

export default new DataLoader(keys =>
    User.find({
        _id: {
            $in: keys
        }
    }).exec().then(sortResult(keys, 'User'))
);
