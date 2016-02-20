import rethinkdbdash from 'rethinkdbdash';

export default rethinkdbdash({
    db: 'test',
    servers: [
        {
            host: 'localhost',
            port: 28015
        }
    ]
});
