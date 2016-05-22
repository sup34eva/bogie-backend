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
    name: 'Payment',
    description: 'A PayPal payment',
    fields: () => ({
        id: globalIdField('Payment'),
        link: {
            type: GraphQLString,
            resolve(payment) {
                return payment.links.find(link => link.method === 'REDIRECT').href;
            }
        }
    }),
    interfaces: [nodeInterface]
});
