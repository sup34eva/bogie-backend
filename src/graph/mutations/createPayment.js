import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';

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
    async mutateAndGetPayload({returnUrl, cancelUrl}) {
        const payment = await createPayment({
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
                    total: '100'
                }
            }]
        });

        return {
            payment
        };
    }
});
