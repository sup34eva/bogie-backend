import {
    connectionDefinitions
} from 'graphql-relay';

import trainType from './types/train';
import stationType from './types/station';
import lineType from './types/line';

export const {
    connectionType: trainConnection,
    edgeType: trainEdge
} = connectionDefinitions({
    name: 'Train',
    nodeType: trainType
});

export const {
    connectionType: stationConnection,
    edgeType: stationEdge
} = connectionDefinitions({
    name: 'Station',
    nodeType: stationType
});

export const {
    connectionType: lineConnection,
    edgeType: lineEdge
} = connectionDefinitions({
    name: 'Line',
    nodeType: lineType
});
