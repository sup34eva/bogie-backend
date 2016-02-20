import {
  GraphQLObjectType
} from 'graphql';
import {
    globalIdField
} from 'graphql-relay';
import {
    nodeInterface
} from '../node';

import stationType from './station';
import dateType from './date';
import stationLoader from '../../loaders/station';

export default new GraphQLObjectType({
    name: 'Train',
    description: 'A train travel',
    fields: {
        id: globalIdField('Train'),
        departure: {
            type: stationType,
            resolve: ({departure}) => stationLoader.load(departure)
        },
        arrival: {
            type: stationType,
            resolve: ({arrival}) => stationLoader.load(arrival)
        },
        date: {
            type: dateType
        }
    },
    interfaces: [nodeInterface]
});
