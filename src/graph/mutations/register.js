import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';

import r from '../../db';
import userType from '../types/user';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    hashAsync
} from '../../utils/crypto';

export default mutationWithClientCheck({
    name: 'Register',
    description: 'Register a new user',
    inputFields: {
        email: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({email, password}) {
        const encryptedPass = await hashAsync(password);
        const id = r.uuid(email);
        const data = await r.table('users').insert({
            id,
            email,
            password: encryptedPass,
            createdAt: r.now()
        });

        if (data.errors) {
            throw new Error(data.first_error);
        }

        if (data.inserted !== 1) {
            throw new Error('Could not create user');
        }

        return r.table('users').get(id).then(user => ({
            user
        }));
    }
});
