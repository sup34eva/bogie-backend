import {
    fromGlobalId,
    nodeDefinitions
} from 'graphql-relay';

import stationLoader from '../loaders/station';
import userLoader from '../loaders/user';

export const {nodeInterface, nodeField} = nodeDefinitions(
    globalId => {
        const {type, id} = fromGlobalId(globalId);
        if (type === 'Station') {
            return stationLoader.load(id);
        }
        if (type === 'User') {
            return userLoader.load(id);
        }
        if (type === 'Line') {
            return {id};
        }
        return null;
    },
    obj => {
        console.log('node', obj);

        if (obj.departure) {
            return require('./types/train').default;
        }

        if (obj.lines) {
            return require('./types/station').default;
        }

        if (obj.password) {
            return require('./types/user').default;
        }

        if (obj.id) {
            return require('./types/line').default;
        }

        return null;
    }
);
