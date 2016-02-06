import DataLoader from 'dataloader';
import RefreshToken from '../entities/refreshToken';

import {
    sortResult
} from '../utils/loaderHelpers';

export default new DataLoader(keys =>
    RefreshToken.find({
        _id: {
            $in: keys
        }
    }).exec().then(sortResult(keys, 'RefreshToken'))
);
