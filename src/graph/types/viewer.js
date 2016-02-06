import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} from 'graphql';

import {
    connectionArgs,
    connectionFromPromisedArray
} from 'graphql-relay';

import Train from '../../entities/train';
import dateType from './date';
import userType from './user';

import tokenLoader from '../../loaders/accessToken';
import userLoader from '../../loaders/user';
import clientLoader from '../../loaders/client';

import {
    trainConnection
} from '../connections';

const Viewer = new GraphQLObjectType({
    name: 'Viewer',
    description: 'A holder type to access other data',
    fields: {
        me: {
            type: userType,
            resolve: ({user}) => user
        },
        trains: {
            type: trainConnection,
            args: Object.assign({
                departure: {
                    type: GraphQLID
                },
                arrival: {
                    type: GraphQLID
                },
                maxDate: {
                    type: dateType
                },
                minDate: {
                    type: dateType
                }
            }, connectionArgs),
            resolve(src, args) {
                const {departure, arrival, before, after} = args;
                const query = Train.find();

                if (departure) {
                    query.where('departure').equals(departure);
                }
                if (arrival) {
                    query.where('arrival').equals(arrival);
                }

                if (before) {
                    query.where('date').lt(before);
                }
                if (after) {
                    query.where('date').gt(after);
                }

                return connectionFromPromisedArray(query.exec(), args);
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
            user: userId,
            client: clientId,
            scope
        } = await tokenLoader.load(token);
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
