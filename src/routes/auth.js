import oauth2orize from 'oauth2orize';
import passport from 'passport';

import user from '../loaders/user';
import client from '../loaders/client';

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
    // TODO: Check token

    done(null, {}, {});
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

        // TODO: Create tokens

        done(null, 'access', 'refresh', {});
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
