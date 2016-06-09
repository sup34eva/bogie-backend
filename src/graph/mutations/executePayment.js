import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLID
} from 'graphql';
import jwt from 'jsonwebtoken';

import userLoader from '../../loaders/user';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    executePayment
} from '../../utils/paypal';
import {
    makePDF
} from '../../utils/pdf';
import {
    sendMail
} from '../../utils/mail';

export default mutationWithClientCheck({
    name: 'ExecutePayment',
    description: `Execute a PayPal payment`,
    inputFields: {
        accessToken: {
            type: GraphQLString
        },

        payment: {
            type: new GraphQLNonNull(GraphQLID)
        },
        payer: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        receipt: {
            type: GraphQLString
        }
    },
    async mutateAndGetPayload({accessToken, payment: paymentId, payer}) {
        await executePayment(paymentId, {
            payer_id: payer
        });

        if (accessToken) {
            const {
                sub: userId
            } = jwt.verify(accessToken, process.env.TOKEN_SECRET);

            const user = userLoader.load(userId);
            await sendMail(user.email, 'Bogie', `
                You got mail !
            `);
        }

        return {
            receipt: await makePDF(`Receipt`)
        };
    }
});
