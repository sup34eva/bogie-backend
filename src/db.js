import rethinkdbdash from 'rethinkdbdash';

export default rethinkdbdash({
    db: 'bogie',
    servers: JSON.parse(process.env.DATABASE)
});
