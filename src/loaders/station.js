import DataLoader from 'dataloader';
import Station from '../entities/station';

import {
    sortResult
} from '../utils/loaderHelpers';

export default new DataLoader(keys =>
    Station.find({
        _id: {
            $in: keys
        }
    }).exec().then(sortResult(keys, 'Station'))
);
