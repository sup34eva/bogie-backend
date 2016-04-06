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
        const {generated_keys: [id]} = await r.table('users').insert({
            id: r.uuid(username),
            username,
            password: encryptedPass,
            createdAt: r.now()
        });

        return {
            user: {
                id
            }
        };
    }
});
