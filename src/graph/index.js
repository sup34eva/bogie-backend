import {
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import {
    nodeField
} from './node';

import viewerField from './types/viewer';
import grantPassword from './mutations/grantPassword';
import register from './mutations/register';

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
            grantPassword,
            register
        }
    })
});
