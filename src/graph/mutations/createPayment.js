import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLID
} from 'graphql';

import makePath from '../../dijkstra';
import paymentType from '../types/payment';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    createPayment
} from '../../utils/paypal';

export default mutationWithClientCheck({
    name: 'CreatePayment',
    description: `Create a PayPal payment intent`,
    inputFields: {
        from: {
            type: new GraphQLNonNull(GraphQLID)
        },
        to: {
            type: new GraphQLNonNull(GraphQLID)
        },

        returnUrl: {
            type: new GraphQLNonNull(GraphQLString)
        },
        cancelUrl: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        payment: {
            type: paymentType
        }
    },
    async mutateAndGetPayload({from, to, returnUrl, cancelUrl}) {
        const path = makePath(from, to);
        return {
            payment: await createPayment({
                intent: 'sale',
                payer: {
                    payment_method: 'paypal'
                },
                redirect_urls: {
                    return_url: returnUrl,
                    cancel_url: cancelUrl
                },
                transactions: [{
                    description: 'Train ticket',
                    amount: {
                        currency: 'EUR',
                        total: path.length * 0.25
                    }
                }]
            })
        };
    }
});
