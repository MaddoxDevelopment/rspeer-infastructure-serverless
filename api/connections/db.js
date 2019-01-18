const Database = (() => {
    let instance;

    function createInstance() {
        const {Client} = require('pg');
        const instance = new Client({
            user: process.env.postgres_user,
            host: process.env.postgres_host,
            database: process.env.postgres_database,
            password: process.env.postgres_password,
            port: process.env.postgres_port,
            ssl: true
        });
        console.log("Connecting to database.");
        instance.connect();
        return instance;
    }

    return {
        cleanup: function () {
            if (instance != null) {
                instance.end();
            }
        },
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = Database;