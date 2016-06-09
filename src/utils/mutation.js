import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';
import clientLoader from '../loaders/client';

export function mutationWithClientCheck(config) {
    return mutationWithClientMutationId({
        ...config,
        inputFields: {
            ...config.inputFields,
            clientId: {
                type: new GraphQLNonNull(GraphQLString)
            },
            clientSecret: {
                type: new GraphQLNonNull(GraphQLString)
            }
        },
        async mutateAndGetPayload(input, context, info) {
            const client = await clientLoader.load(input.clientId);
            if (client === null) {
                clientLoader.clear(input.clientId);
                throw new Error(`Client "${input.clientId}" not found`);
            }
            if (client.secret !== input.clientSecret) {
                throw new Error('Wrong client secret');
            }

            return Promise.resolve(
                config.mutateAndGetPayload(input, context, info)
            );
        }
    });
}
