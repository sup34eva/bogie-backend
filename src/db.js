import rethinkdbdash from 'rethinkdbdash';

export default rethinkdbdash({
    db: 'bogie',
    servers: [{
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT
    }]
});
