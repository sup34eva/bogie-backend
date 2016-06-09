import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLID
} from 'graphql';
import {
    connectionArgs
} from 'graphql-relay';

import jwt from 'jsonwebtoken';
import makePath from '../../dijkstra';

import dateType from '../../loaders/date';
import userLoader from '../../loaders/user';
import emailLoader from '../../loaders/email';
import clientLoader from '../../loaders/client';
import stationNameLoader from '../../loaders/stationName';

import r from '../../db';

import userType from './user';
import stationType from './station';
import lineType from './line';
import trainType from './train';

import {
    connectionFromReQL
} from '../../utils/rdb';

const Viewer = new GraphQLObjectType({
    name: 'Viewer',
    description: 'A holder type to access other data',
    fields: () => ({
        // Users
        me: {
            type: userType,
            resolve: ({user}) => user
        },
        user: {
            type: userType,
            args: {
                email: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(viewer, {email}) {
                return emailLoader.load(email);
            }
        },

        // Stations
        stations: {
            type: require('../connections').stationConnection,
            args: {
                ...connectionArgs,
                filter: {
                    type: GraphQLString
                }
            },
            resolve(viewer, args) {
                return connectionFromReQL(args.filter ?
                    r.table('stations').filter(
                        r.row('name').slice(0, args.filter.length).downcase().eq(args.filter.toLowerCase())
                    ) :
                    r.table('stations')
                , args);
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

        // Train
        train: {
            type: trainType,
            args: {
                from: {
                    type: new GraphQLNonNull(GraphQLID)
                },
                to: {
                    type: new GraphQLNonNull(GraphQLID)
                },
                date: {
                    type: new GraphQLNonNull(dateType)
                },
                before: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                after: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve(viewer, args) {
                const time = args.after + Math.round((args.before - args.after) * Math.random());
                return makePath(args.from, args.to)
                    .then(path => stationNameLoader.loadMany(path))
                    .then(stations => ({
                        id: `${args.from}:${args.to}`,
                        stations,
                        date: new Date(args.date.getTime() + (time * 15 * 60 * 1000)),
                        price: stations.length * 0.25
                    }));
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
        if (user === null) {
            userLoader.clear(userId);
            throw new Error(`Could not find user ${userId}`);
        }

        const client = await clientLoader.load(clientId);
        if (client === null) {
            clientLoader.clear(clientId);
            throw new Error(`Could not find client ${clientId}`);
        }

        return {
            ...rootValue,
            user,
            client,
            scope
        };
    }
};
