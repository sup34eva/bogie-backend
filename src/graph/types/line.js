import {
    GraphQLObjectType
} from 'graphql';
import {
    globalIdField,
    connectionArgs,
    connectionFromPromisedArray
} from 'graphql-relay';

import lineLoader from '../../loaders/line';

import {
    nodeInterface
} from '../node';

export default new GraphQLObjectType({
    name: 'Line',
    description: 'A train line',
    fields: () => ({
        id: globalIdField('Line'),
        stations: {
            type: require('../connections').stationConnection,
            args: connectionArgs,
            resolve(line, args) {
                return connectionFromPromisedArray(
                    lineLoader.load(line.id),
                    args
                );
            }
        }
    }),
    interfaces: [nodeInterface]
});
