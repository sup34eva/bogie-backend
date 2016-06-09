import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import jwt from 'jsonwebtoken';

import emailLoader from '../../loaders/email';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    compareAsync
} from '../../utils/crypto';

export default mutationWithClientCheck({
    name: 'GrantPassword',
    description: `Allows an authenticated client to obtain an access token with a user's credentials`,
    inputFields: {
        email: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        },
        scope: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        token: {
            type: GraphQLString
        }
    },
    async mutateAndGetPayload({clientId, email, password, scope}) {
        const user = await emailLoader.load(email);
        if (user === null) {
            emailLoader.clear(email);
            throw new Error(`User "${email}" not found`);
        }

        const equals = await compareAsync(password, user.password);
        if (!equals) {
            throw new Error('Wrong password');
        }

        const token = jwt.sign({
            sub: user.id,
            aud: clientId,
            scope
        }, process.env.TOKEN_SECRET);

        return {
            token
        };
    }
});
