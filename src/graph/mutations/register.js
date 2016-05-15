import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';
import {
    hash
} from 'bcrypt-nodejs';

import r from '../../db';
import userType from '../types/user';

function hashAsync(data, salt, progress) {
    return new Promise((resolve, reject) => {
        hash(data, salt, progress, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

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
