import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLID
} from 'graphql';
import {
    connectionArgs,
    connectionFromPromisedArray
} from 'graphql-relay';

import jwt from 'jsonwebtoken';
import makePath from '../../dijkstra';

import userLoader from '../../loaders/user';
import usernameLoader from '../../loaders/username';
import clientLoader from '../../loaders/client';
import stationNameLoader from '../../loaders/stationName';

import trainSearch from '../trainSearch';
import r from '../../db';

import userType from './user';
import stationType from './station';
import lineType from './line';

import {
    connectionFromReQL
} from '../../utils';

const Viewer = new GraphQLObjectType({
    name: 'Viewer',
    description: 'A holder type to access other data',
    fields: () => ({
        // Trains
        trains: trainSearch,

        // Users
        me: {
            type: userType,
            resolve: ({user}) => user
        },
        user: {
            type: userType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(viewer, {name}) {
                return usernameLoader.load(name);
            }
        },

        // Stations
        stations: {
            type: require('../connections').stationConnection,
            args: connectionArgs,
            resolve(viewer, args) {
                return connectionFromReQL(r.table('stations'), args);
            }
        },
        station: {
            type: stationType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(viewer, {name}) {
                return stationNameLoader.load(name);
            }
        },

        // Lines
        lines: {
            type: require('../connections').lineConnection,
            args: connectionArgs,
            resolve(viewer, args) {
                return connectionFromReQL(
                    r.table('stations').concatMap(
                        r.row('lines')
                    ).distinct().map(id => ({id})),
                    args
                );
            }
        },
        line: {
            type: lineType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve(viewer, args) {
                return args;
            }
        },

        // Route
        route: {
            type: require('../connections').stationConnection,
            args: {
                ...connectionArgs,
                from: {
                    type: new GraphQLNonNull(GraphQLID)
                },
                to: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve(viewer, args) {
                return connectionFromPromisedArray(
                    makePath(
                        args.from, args.to
                    ).then(path =>
                        Promise.all(
                            path.map(key => stationNameLoader.load(key))
                        )
                    ),
                    args
                );
            }
        }
    })
});

export default {
    type: Viewer,
    args: {
        token: {
            type: GraphQLString
        }
    },
    async resolve(rootValue, {token}) {
        if (!token) {
            return rootValue;
        }

        const {
            sub: userId,
            aud: clientId,
            scope
        } = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await userLoader.load(userId);
        const client = await clientLoader.load(clientId);

        return {
            ...rootValue,
            user,
            client,
            scope
        };
    }
};
