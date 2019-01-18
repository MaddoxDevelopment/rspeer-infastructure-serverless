const Database = (() => {
    let instance;

    async function createInstance() {
        return new Promise((resolve, reject) => {
            const {Client} = require('pg');
            const instance = new Client({
                user: process.env.postgres_user,
                host: process.env.postgres_host,
                database: process.env.postgres_database,
                password: process.env.postgres_password,
                port: process.env.postgres_port,
                ssl: true
            });
            instance.connect((err) => {
                err ? reject(err) : resolve(instance);
            });
        });
    }

    return {
        isAlive : async function() {
          const instance = await createInstance();
          return instance != null;
        },
        cleanup: function () {
            if (instance != null) {
                instance.end();
            }
        },
        getInstance: async function () {
            if (!instance) {
                instance = await createInstance();
            }
            return instance;
        }
    };
})();

module.exports = Database;