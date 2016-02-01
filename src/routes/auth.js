import oauth2orize from 'oauth2orize-koa';
import passport from 'koa-passport';

import userLoader from '../loaders/user';
import client from '../loaders/client';
import accessToken from '../loaders/accessToken';

import AccessToken from '../entities/accessToken';

import {
    BasicStrategy
} from 'passport-http';

import ClientPasswordStrategy from 'passport-oauth2-client-password';
import BearerStrategy from 'passport-http-bearer';

function checkClient(id, secret, done) {
    client.load(id).then(client => {
        if (client.secret !== secret) {
            return done(null, false);
        }

        done(null, client);
    }).catch(err => {
        done(err);
    });
}

passport.use(new BasicStrategy(checkClient));
passport.use(new ClientPasswordStrategy(checkClient));

passport.use(new BearerStrategy((token, done) => {
    accessToken.load(token).then(token =>
        userLoader.load(token.user).then(user => {
            done(null, user, {
                scope: token.scope
            });
        })
    ).catch(err => {
        done(err);
    });
}));

const server = oauth2orize.createServer();

server.serializeClient(({id}, done) => done(null, id));

server.deserializeClient((id, done) => {
    client.load(id).then(client => {
        done(null, client);
    }).catch(err => {
        done(err);
    });
});

server.exchange(oauth2orize.exchange.password(async (client, username, password, scope) => {
    const user = await userLoader.load(username);

    if (user.password !== password) {
        return false;
    }

    const {_id: token} = await AccessToken.create({
        client: user._id,
        user: username,
        scope
    });

    return token;
}));

export default [
    passport.authenticate(['basic', 'oauth2-client-password'], {
        session: false
    }),
    server.token(),
    server.errorHandler()
];
