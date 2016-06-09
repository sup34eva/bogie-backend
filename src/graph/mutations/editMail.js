import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import jwt from 'jsonwebtoken';

import r from '../../db';
import userType from '../types/user';
import userLoader from '../../loaders/user';

import {
    mutationWithClientCheck
} from '../../utils/mutation';

export default mutationWithClientCheck({
    name: 'EditEmail',
    description: 'Change the email for a user',
    inputFields: {
        token: {
            type: new GraphQLNonNull(GraphQLString)
        },
        email: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        token: {
            type: GraphQLString
        },
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({token, email}) {
        const {
            sub: currentId,
            aud: clientId,
            scope
        } = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await userLoader.load(currentId);

        const newId = r.uuid(email);
        const data = await r.table('users').get(user.id).update({
            id: newId,
            email
        });

        if (data.errors) {
            throw new Error(data.first_error);
        }

        if (data.updated !== 1) {
            throw new Error('Could not update mail');
        }

        userLoader.clear(user.id);
        const newToken = jwt.sign({
            sub: newId,
            aud: clientId,
            scope
        }, process.env.TOKEN_SECRET);

        return r.table('users').get(newId).then(user => ({
            token: newToken,
            user
        }));
    }
});
