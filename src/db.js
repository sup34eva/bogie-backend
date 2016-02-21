import rethinkdbdash from 'rethinkdbdash';

export default rethinkdbdash({
    db: 'test',
    servers: [
        {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT
        }
    ]
});
