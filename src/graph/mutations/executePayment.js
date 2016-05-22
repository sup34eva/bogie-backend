import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLID
} from 'graphql';

import r from '../../db';
import paymentType from '../types/payment';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    executePayment
} from '../../utils/paypal';

export default mutationWithClientCheck({
    name: 'ExecutePayment',
    description: `Execute a PayPal payment`,
    inputFields: {
        payment: {
            type: new GraphQLNonNull(GraphQLID)
        },
        payer: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        payment: {
            type: paymentType
        }
    },
    async mutateAndGetPayload({payment: paymentId, payer}) {
        const payment = await executePayment(paymentId, {
            payer_id: payer
        });

        return {
            payment
        };
    }
});
