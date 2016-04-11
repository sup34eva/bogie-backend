import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';
import {
    connectionArgs,
    connectionFromPromisedArray
} from 'graphql-relay';

import jwt from 'jsonwebtoken';

import userLoader from '../../loaders/user';
import usernameLoader from '../../loaders/username';
import clientLoader from '../../loaders/client';
import stationNameLoader from '../../loaders/stationName';

import trainSearch from '../trainSearch';
import r from '../../db';

import userType from './user';
import stationType from './station';
import lineType from './line';

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
            resolve(src, {name}) {
                return usernameLoader.load(name);
            }
        },

        // Stations
        stations: {
            type: require('../connections').stationConnection,
            args: connectionArgs,
            resolve(station, args) {
                return connectionFromPromisedArray(
                    r.table('stations').run(),
                    args
                );
            }
        },
        station: {
            type: stationType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(src, {name}) {
                return stationNameLoader.load(name);
            }
        },

        // Lines
        lines: {
            type: require('../connections').lineConnection,
            args: connectionArgs,
            resolve(station, args) {
                return connectionFromPromisedArray(
                    r.table('stations').concatMap(
                        r.row('lines')
                    ).distinct().map(id => ({id})).run(),
                    args
                );
            }
        },
        line: {
            type: lineType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(src, args) {
                return args;
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
