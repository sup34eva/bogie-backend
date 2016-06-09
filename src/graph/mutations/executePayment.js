import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLID
} from 'graphql';
import jwt from 'jsonwebtoken';

import r from '../../db';
import makePath from '../../dijkstra';
import userLoader from '../../loaders/user';
import stationLoader from '../../loaders/stationName';

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
        email: {
            type: GraphQLString
        },
        accessToken: {
            type: GraphQLString
        },

        from: {
            type: new GraphQLNonNull(GraphQLID)
        },
        to: {
            type: new GraphQLNonNull(GraphQLID)
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
    async mutateAndGetPayload({email, accessToken, from, to, payment: paymentId, payer}) {
        await executePayment(paymentId, {
            payer_id: payer
        });

        if (accessToken) {
            const {
                sub: userId
            } = jwt.verify(accessToken, process.env.TOKEN_SECRET);

            const user = userLoader.load(userId);
            email = user.email;

            if (user.history) {
                await r.table('users').get(userId)('history').append({from, to});
            } else {
                await r.table('users').get(userId).update({
                    history: [{from, to}]
                });
            }
        }

        const path = makePath(from, to);
        const start = await stationLoader.load(from);
        const end = await stationLoader.load(to);
        await sendMail(email, 'Bogie - Ticket', `
            You just purchased a ticket from ${start.name} to ${end.name} for ${path.length * 0.25}€.
        `);

        return {
            receipt: await makePDF(`
                # Receipt
                Departure: ${start.name}
                Arrival: ${end.name}
                Price: ${path.length * 0.25}€
            `)
        };
    }
});
