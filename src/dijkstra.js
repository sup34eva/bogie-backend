import PriorityQueue from 'node-dijkstra/libs/PriorityQueue';

export default async function makePath(start, goal, graph) {
    const explored = new Set();
    const frontier = new PriorityQueue();
    const previous = new Map();

    const path = [];

    frontier.set(start, 0);

    function iterate(neighbors, node) {
        return _node => {
            const _cost = neighbors[_node];

            if (explored.has(_node)) {
                return false;
            }

            if (!frontier.has(_node)) {
                previous.set(_node, node.key);
                return frontier.set(_node, node.priority + _cost);
            }

            const frontierPriority = frontier.get(_node).priority;
            const nodeCost = node.priority + _cost;

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

        const neighbors = await graph(node.key);
        Object.keys(neighbors).forEach(iterate(neighbors, node));
    }

    if (!path.length) {
        throw new Error('Path is empty');
    }

    return path.concat([
        start
    ]).reverse();
}
