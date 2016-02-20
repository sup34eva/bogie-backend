import DataLoader from 'dataloader';
import r from '../db';
import stationLoader from './station';

export default new DataLoader(keys =>
    stationLoader.loadMany(keys.map(key => r.uuid(key)))
);
