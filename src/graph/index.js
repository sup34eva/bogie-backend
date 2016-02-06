import {
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import {
    nodeField
} from './node';

import viewerField from './types/viewer';
import exchangeMutation from './mutations/exchange';

export default new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            viewer: viewerField,
            node: nodeField
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
            exchange: exchangeMutation
        }
    })
});
