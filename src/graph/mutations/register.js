import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId,
    toGlobalId
} from 'graphql-relay';
import {
    hash
} from 'bcrypt-nodejs';

import User from '../../entities/user';

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
        id: {
            type: GraphQLString
        }
    },
    async mutateAndGetPayload({username, password}) {
        const encryptedPass = await hashAsync(password);
        await User.create({
            username,
            password: encryptedPass,
            createdAt: new Date()
        });

        return {
            id: toGlobalId('User', username),
            expires: 3600
        };
    }
});
