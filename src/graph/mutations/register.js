import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';

import r from '../../db';
import userType from '../types/user';

import {
    hashAsync
} from '../../utils';

export default mutationWithClientMutationId({
    name: 'Register',
    description: 'Register a new user',
    inputFields: {
        username: {
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
    async mutateAndGetPayload({username, password}) {
        const encryptedPass = await hashAsync(password);
        const id = r.uuid(username);
        const data = await r.table('users').insert({
            id,
            username,
            password: encryptedPass,
            createdAt: r.now()
        });

        if(data.errors) {
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
