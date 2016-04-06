import {
    fromGlobalId,
    nodeDefinitions
} from 'graphql-relay';

import trainLoader from '../loaders/train';
import stationLoader from '../loaders/station';
import userLoader from '../loaders/user';

export const {nodeInterface, nodeField} = nodeDefinitions(
    globalId => {
        const {type, id} = fromGlobalId(globalId);
        if (type === 'Train') {
            return trainLoader.load(id);
        }
        if (type === 'Station') {
            return stationLoader.load(id);
        }
        if (type === 'User') {
            return userLoader.load(id);
        }
        return null;
    },
    obj => {
        if (obj.departure) {
            return require('./types/train').default;
        }

        if (obj.lines) {
            return require('./types/station').default;
        }

        if (obj.password) {
            return require('./types/user').default;
        }

        return null;
    }
);
