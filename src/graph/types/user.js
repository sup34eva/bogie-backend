import {
  GraphQLObjectType
} from 'graphql';
import {
    globalIdField
} from 'graphql-relay';
import {
    nodeInterface
} from '../node';

export default new GraphQLObjectType({
    name: 'User',
    description: 'A generic user of the service',
    fields: {
        id: globalIdField('User', user => user._id)
    },
    interfaces: [nodeInterface]
});
