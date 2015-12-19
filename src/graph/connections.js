import {
    connectionDefinitions
} from 'graphql-relay';

import trainType from './types/train';

export const {
    connectionType: trainConnection,
    edgeType: trainEdge
} = connectionDefinitions({
    name: 'Train',
    nodeType: trainType
});
