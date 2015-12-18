import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLList,
  GraphQLID,
  GraphQLString
} from 'graphql';

import Train from '../entities/train';
import trainLoader from '../loaders/train';
import stationLoader from '../loaders/station';

const dateType = new GraphQLScalarType({
    name: 'Date',
    description: `Anything parseable as a JS Date object is accepted as input. The returned value will always be serialized as an ISO String.`,
    serialize: value => value.toISOString(),
    parseValue: value => new Date(value),
    parseLiteral: ast => new Date(ast.value)
});

const stationType = new GraphQLObjectType({
    name: 'Station',
    description: 'A train station',
    fields: {
        id: {
            type: GraphQLID,
            resolve: ({_id}) => _id
        },
        name: {
            type: GraphQLString
        }
    }
});

const trainType = new GraphQLObjectType({
    name: 'Train',
    description: 'A train travel',
    fields: {
        id: {
            type: GraphQLID,
            resolve: ({_id}) => _id
        },
        departure: {
            type: stationType,
            resolve: ({departure}) => stationLoader.load(departure)
        },
        arrival: {
            type: stationType,
            resolve: ({arrival}) => stationLoader.load(arrival)
        },
        date: {
            type: dateType
        }
    }
});

export default new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            trains: {
                type: new GraphQLList(trainType),
                args: {
                    departure: {
                        type: GraphQLID
                    },
                    arrival: {
                        type: GraphQLID
                    },
                    before: {
                        type: dateType
                    },
                    after: {
                        type: dateType
                    }
                },
                resolve(src, {departure, arrival, before, after}) {
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

                    return query.exec();
                }
            },
            train: {
                type: trainType,
                args: {
                    id: {
                        type: GraphQLID
                    }
                },
                resolve: (src, {id}) => trainLoader.load(id)
            },
            station: {
                type: stationType,
                args: {
                    id: {
                        type: GraphQLID
                    }
                },
                resolve: (src, {id}) => stationLoader.load(id)
            }
        }
    })
});
