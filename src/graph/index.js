import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID
} from 'graphql';

import {
    connectionArgs,
    connectionFromPromisedArray
} from 'graphql-relay';

import {
    nodeField
} from './node';

import Train from '../entities/train';
import dateType from './types/date';

import {
    trainConnection
} from './connections';

export default new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
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
            },
            node: nodeField
        }
    })
});
