import mongoose from 'mongoose';

mongoose.Promise = Promise;

mongoose.connect(process.env.DATABASE_URL, {
    server: {
        poolSize: 4
    }
});

mongoose.connection.on('error', err => {
    console.error('Connection error', err);
});

mongoose.connection.once('open', () => {
    console.log('Database connection open');
});

export default mongoose;
