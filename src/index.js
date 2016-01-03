import 'babel-polyfill';
import express from 'express';

import morgan from 'morgan';
import {
    json, urlencoded
} from 'body-parser';

import authRouter from './routes/auth';
import graphRouter from './routes/graphql';

const app = express();

app.use(morgan('combined'));

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(json());
app.use(urlencoded({
    extended: true
}));

app.use('/auth', authRouter);
app.use('/graphql', graphRouter);

if (process.env.NODE_ENV !== 'production') {
    const errorhandler = require('errorhandler');
    app.use(errorhandler());
}

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
