import {
    GraphQLObjectType,
    GraphQLString
} from 'graphql';
import {
    globalIdField,
    connectionArgs,
    connectionFromArray,
    connectionFromPromisedArray
} from 'graphql-relay';

import trainLoader from '../../loaders/train';

import {
    nodeInterface
} from '../node';

export default new GraphQLObjectType({
    name: 'User',
    description: 'A generic user of the service',
    fields: {
        id: globalIdField('User'),
        email: {
            type: GraphQLString
        },
        history: {
            type: require('../connections').trainConnection,
            args: connectionArgs,
            resolve(line, args) {
                if (line.history) {
                    return connectionFromPromisedArray(
                        trainLoader.loadMany(line.history),
                        args
                    );
                }

                return connectionFromArray([], args);
            }
        }
    },
    interfaces: [nodeInterface]
});
