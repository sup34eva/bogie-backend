import {
  GraphQLScalarType
} from 'graphql';

export default new GraphQLScalarType({
    name: 'Date',
    description: `Anything parseable as a JS Date object is accepted as input. The returned value will always be serialized as an ISO String.`,
    serialize: value => value.toISOString(),
    parseValue: value => new Date(value),
    parseLiteral: ast => new Date(ast.value)
});
