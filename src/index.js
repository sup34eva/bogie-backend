import 'babel-polyfill';
import express from 'express';

import admin from 'sriracha-admin';
import errorhandler from 'errorhandler';
import debug from 'express-debug';
import morgan from 'morgan';

import authRouter from './routes/auth';
import graphRouter from './routes/graphql';

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/auth', authRouter);
app.use('/graphql', graphRouter);

if (process.env.NODE_ENV !== 'production') {
    app.use('/db', admin({
        Train: {
            searchField: '_id'
        },
        Station: {
            searchField: 'name'
        }
    }));
    app.use(errorhandler());
    debug(app);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
