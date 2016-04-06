import {
    GraphQLInputObjectType,
    GraphQLID
} from 'graphql';
import {
    connectionArgs,
    connectionFromPromisedArray,
    fromGlobalId
} from 'graphql-relay';

import r from '../db';
import dateType from './types/date';

import {
    trainConnection
} from './connections';

const TrainSearch = new GraphQLInputObjectType({
    name: 'TrainSearch',
    fields: {
        departure: {
            type: GraphQLID
        },
        arrival: {
            type: GraphQLID
        },
        before: {
            type: dateType
        },
        after: {
            type: dateType
        }
    }
});

function filter({departure, arrival, after, before} = {}) {
    const dInfo = departure ? fromGlobalId(departure) : null;
    const aInfo = arrival ? fromGlobalId(arrival) : null;
    const aTime = after ? after.getTime() / 1000 : null;
    const bTime = before ? before.getTime() / 1000 : null;

    return [
        departure && r.row('departure').eq(dInfo.id),
        arrival && r.row('arrival').eq(aInfo.id),
        after && r.row('date').toEpochTime().ge(aTime),
        before && r.row('date').toEpochTime().le(bTime)
    ].reduce((selector, filter) => {
        if (filter) {
            return selector === true ? filter : selector.and(filter);
        }

        return selector;
    }, true);
}

const table = r.table('trains');
function selection({search}) {
    if (search) {
        return table.filter(filter(search));
    }

    return table;
}

export default {
    type: trainConnection,
    args: {
        ...connectionArgs,
        search: {
            type: TrainSearch
        }
    },
    resolve(src, args) {
        return connectionFromPromisedArray(selection(args), args);
    }
};
