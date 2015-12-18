import 'babel-polyfill';
import express from 'express';

import admin from 'sriracha-admin';
import errorhandler from 'errorhandler';
import debug from 'express-debug';

import authRouter from './routes/auth';
import graphRouter from './routes/graphql';

const app = express();

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
