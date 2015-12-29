import oauth2orize from 'oauth2orize';
import passport from 'passport';

import user from '../loaders/user';
import client from '../loaders/client';
import accessToken from '../loaders/accessToken';

import AccessToken from '../entities/accessToken';

import {
    Router as createRouter
} from 'express';
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
        user.load(token.user).then(user => {
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

server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    user.load(username).then(client => {
        if (client.password !== password) {
            return done(null, false);
        }

        AccessToken.create({
            client: client.id,
            user: username,
            scope
        }, (err, {_id}) => {
            if (err) {
                return done(err);
            }
            return done(null, _id);
        });
    }).catch(err => {
        done(err);
    });
}));

const router = createRouter();
export default router;

router.post('/token',
    passport.authenticate(['basic', 'oauth2-client-password'], {
        session: false
    }),
    server.token(),
    server.errorHandler()
);
