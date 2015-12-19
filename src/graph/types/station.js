import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import {
    globalIdField
} from 'graphql-relay';
import {
    nodeInterface
} from '../node';

export default new GraphQLObjectType({
    name: 'Station',
    description: 'A train station',
    fields: {
        id: globalIdField('Station', station => station._id),
        name: {
            type: GraphQLString
        }
    },
    interfaces: [nodeInterface]
});
