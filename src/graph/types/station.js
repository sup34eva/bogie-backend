import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat
} from 'graphql';
import {
    globalIdField,
    connectionArgs,
    connectionFromArray
} from 'graphql-relay';

import {
    nodeInterface
} from '../node';

export default new GraphQLObjectType({
    name: 'Station',
    description: 'A train station',
    fields: () => ({
        id: globalIdField('Station'),
        name: {
            type: GraphQLString
        },
        lines: {
            type: require('../connections').lineConnection,
            args: connectionArgs,
            resolve(station, args) {
                return connectionFromArray(
                    station.lines.map(lineId => ({
                        id: lineId
                    })),
                    args
                );
            }
        },
        latitude: {
            type: GraphQLFloat,
            resolve({location: {coordinates: [, latitude]}}) {
                return latitude;
            }
        },
        longitude: {
            type: GraphQLFloat,
            resolve({location: {coordinates: [longitude]}}) {
                return longitude;
            }
        }
    }),
    interfaces: [nodeInterface]
});
