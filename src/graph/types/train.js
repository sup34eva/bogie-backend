import {
    GraphQLFloat,
    GraphQLObjectType
} from 'graphql';
import {
    globalIdField,
    connectionArgs,
    connectionFromPromisedArray
} from 'graphql-relay';
import {
    nodeInterface
} from '../node';

import dateType from './date';

export default new GraphQLObjectType({
    name: 'Train',
    description: 'A train travel',
    fields: () => ({
        id: globalIdField('Train'),
        stations: {
            type: require('../connections').stationConnection,
            args: connectionArgs,
            resolve({stations}, args) {
                return connectionFromPromisedArray(stations, args);
            }
        },
        date: {
            type: dateType
        },
        price: {
            type: GraphQLFloat
        }
    }),
    interfaces: [nodeInterface]
});
