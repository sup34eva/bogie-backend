import {
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import {
    nodeField
} from './node';

import viewerField from './types/viewer';

import grantPassword from './mutations/grantPassword';
import grantFacebook from './mutations/grantFacebook';
import grantGoogle from './mutations/grantGoogle';
import register from './mutations/register';
import createPayment from './mutations/createPayment';
import executePayment from './mutations/executePayment';

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
            grantFacebook,
            grantGoogle,
            grantPassword,
            register,
            createPayment,
            executePayment
        }
    })
});
