import {
    fromGlobalId,
    nodeDefinitions
} from 'graphql-relay';

import Train from '../entities/train';
import Station from '../entities/station';
import trainLoader from '../loaders/train';
import stationLoader from '../loaders/station';

export const {nodeInterface, nodeField} = nodeDefinitions(
    globalId => {
        const {type, id} = fromGlobalId(globalId);
        if (type === 'Train') {
            return trainLoader.load(id);
        }
        if (type === 'Station') {
            return stationLoader.load(id);
        }
        return null;
    },
    obj => {
        if (obj instanceof Train) {
            return require('./types/train').default;
        }
        if (obj instanceof Station) {
            return require('./types/station').default;
        }
        return null;
    }
);
