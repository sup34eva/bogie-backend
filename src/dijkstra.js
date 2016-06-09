import PriorityQueue from 'node-dijkstra/libs/PriorityQueue';
import graphLoader from './loaders/graph';

export default async function makePath(start, goal) {
    const explored = new Set();
    const frontier = new PriorityQueue();
    const previous = new Map();

    const path = [];

    frontier.set(start, 0);

    function iterate(neighbors, node) {
        return ({weight, edges: [from, to]}) => {
            const _node = from === node.key ? to : from;
            if (explored.has(_node)) {
                return false;
            }

            if (!frontier.has(_node)) {
                previous.set(_node, node.key);
                return frontier.set(_node, node.priority + weight);
            }

            const frontierPriority = frontier.get(_node).priority;
            const nodeCost = node.priority + weight;

            if (nodeCost < frontierPriority) {
                previous.set(_node, node.key);
                frontier.set(_node, nodeCost);
            }
        };
    }

    while (!frontier.isEmpty()) {
        const node = frontier.next();

        if (node.key === goal) {
            let _nodeKey = node.key;
            while (previous.has(_nodeKey)) {
                path.push(_nodeKey);
                _nodeKey = previous.get(_nodeKey);
            }

            break;
        }

        explored.add(node.key);

        const neighbors = await graphLoader.load(node.key);
        neighbors.forEach(iterate(neighbors, node));
    }

    if (!path.length) {
        return [];
    }

    return path.concat([
        start
    ]).reverse();
}
