import DataLoader from 'dataloader';
import AccessToken from '../entities/accessToken';

import {
    sortResult
} from '../utils/loaderHelpers';

export default new DataLoader(keys =>
    AccessToken.find({
        _id: {
            $in: keys
        }
    }).exec().then(sortResult(keys, 'AccessToken'))
);
