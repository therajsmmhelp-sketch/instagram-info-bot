const cache = new Map();

function get(username) {
    const item = cache.get(username.toLowerCase());

    if (!item) return null;

    // 5 minute cache
    if (Date.now() - item.time > 5 * 60 * 1000) {
        cache.delete(username.toLowerCase());
        return null;
    }

    return item.data;
}

function set(username, data) {
    cache.set(username.toLowerCase(), {
        data,
        time: Date.now()
    });
}

module.exports = {
    get,
    set
};
