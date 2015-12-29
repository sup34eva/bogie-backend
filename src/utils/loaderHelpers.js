export function sortResult(keys, className) {
    return result =>
        keys.map(key =>
            result.find(({_id}) => _id.equals(key)) || new Error(`${className} not found: ${key}`)
        );
}
