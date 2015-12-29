import DataLoader from 'dataloader';
import Client from '../entities/client';

import {
    sortResult
} from '../utils/loaderHelpers';

export default new DataLoader(keys =>
    Client.find({
        _id: {
            $in: keys
        }
    }).exec().then(sortResult(keys, 'Client'))
);
