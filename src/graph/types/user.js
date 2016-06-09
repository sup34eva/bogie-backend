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
        type: {
            type: new GraphQLEnumType({
                name: 'UserType',
                values: {
                    EMAIL: {value: 0},
                    FACEBOOK: {value: 1},
                    GOOGLE: {value: 2}
                }
            }),
            resolve(user, args) {
                if (user.fbId) {
                    return 1;
                }

                if (user.googleId) {
                    return 2;
                }

                return 0;
            }
        }
        history: {
            type: require('../connections').trainConnection,
            args: connectionArgs,
            resolve(user, args) {
                if (user.history) {
                    return connectionFromPromisedArray(
                        trainLoader.loadMany(user.history),
                        args
                    );
                }

                return connectionFromArray([], args);
            }
        }
    },
    interfaces: [nodeInterface]
});
