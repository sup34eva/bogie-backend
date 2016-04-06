import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';

import jwt from 'jsonwebtoken';

import userType from './user';
import stationType from './station';

import userLoader from '../../loaders/user';
import usernameLoader from '../../loaders/username';
import clientLoader from '../../loaders/client';
import stationNameLoader from '../../loaders/stationName';

import trainSearch from '../trainSearch';

const Viewer = new GraphQLObjectType({
    name: 'Viewer',
    description: 'A holder type to access other data',
    fields: {
        me: {
            type: userType,
            resolve: ({user}) => user
        },
        trains: trainSearch,
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
        }
    }
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
