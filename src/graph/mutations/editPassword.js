import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';
import jwt from 'jsonwebtoken';

import r from '../../db';
import userType from '../types/user';
import userLoader from '../../loaders/user';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    compareAsync
} from '../../utils/crypto';

export default mutationWithClientMutationId({
    name: 'EditPassword',
    description: 'Change the password for a user',
    inputFields: {
        token: {
            type: new GraphQLNonNull(GraphQLString)
        },
        currentPassword: {
            type: new GraphQLNonNull(GraphQLString)
        },
        newPassword: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({token, currentPassword, newPassword}) {
        const {
            sub: currentId
        } = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await userLoader.load(currentId);
        const equals = await compareAsync(currentPassword, user.password);
        if (!equals) {
            throw new Error('Wrong password');
        }

        const encryptedPass = await hashAsync(newPassword);
        const data = await r.table('users').get(user.id).update({
            password: encryptedPass
        });

        if (data.errors) {
            throw new Error(data.first_error);
        }

        if (data.updated !== 1) {
            throw new Error('Could not update password');
        }

        userLoader.clear(user.id);
        return r.table('users').get(id).then(user => ({
            user
        }));
    }
});
