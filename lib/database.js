const fs = require("fs");

const DB = "database.json";

function init() {

    if (!fs.existsSync(DB)) {

        fs.writeFileSync(DB, JSON.stringify({
            users: [],
            searches: [],
            stats: {
                totalUsers: 0,
                totalSearches: 0
            }
        }, null, 4));

    }

}

function read() {

    init();

    return JSON.parse(fs.readFileSync(DB));

}

function write(data) {

    fs.writeFileSync(DB, JSON.stringify(data, null, 4));

}

function addUser(id) {

    const db = read();

    if (!db.users.includes(id)) {

        db.users.push(id);

        db.stats.totalUsers = db.users.length;

        write(db);

    }

}

function addSearch(username) {

    const db = read();

    db.searches.unshift({
        username,
        date: new Date().toLocaleString()
    });

    if (db.searches.length > 100)
        db.searches.pop();

    db.stats.totalSearches++;

    write(db);

}

module.exports = {
    addUser,
    addSearch,
    read
};
