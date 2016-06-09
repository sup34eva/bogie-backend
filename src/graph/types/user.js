import {
    GraphQLObjectType,
    GraphQLEnumType,
    GraphQLString
} from 'graphql';
import {
    globalIdField,
    connectionArgs,
    connectionFromArray,
    connectionFromPromisedArray
} from 'graphql-relay';

import makePath from '../../dijkstra';
import stationNameLoader from '../../loaders/stationName';

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
                    UNKNOWN: {value: 0},
                    EMAIL: {value: 1},
                    FACEBOOK: {value: 2},
                    GOOGLE: {value: 3}
                }
            }),
            resolve(user) {
                if (user.password) {
                    return 1;
                }

                if (user.fbId) {
                    return 2;
                }

                if (user.googleId) {
                    return 3;
                }

                return 0;
            }
        },
        history: {
            type: require('../connections').trainConnection,
            args: connectionArgs,
            resolve(user, args) {
                if (user.history) {
                    return connectionFromPromisedArray(
                        Promise.all(
                            user.history.map(({from, to}) =>
                                makePath(from, to)
                                    .then(path => stationNameLoader.loadMany(path))
                                    .then(stations => ({
                                        id: `${args.from}:${args.to}`,
                                        stations,
                                        date: new Date(),
                                        price: stations.length * 0.25
                                    }))
                            )
                        ),
                        args
                    );
                }

                return connectionFromArray([], args);
            }
        }
    },
    interfaces: [nodeInterface]
});
