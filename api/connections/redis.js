const Redis = (() => {
    let instance;
    const getClient = () => {
        if (instance != null) {
            return instance;
        }
        return new Promise((resolve) => {
            const Redis = require('ioredis');
            let client = new Redis({
                host: process.env.redis_host,
                password: process.env.redis_password,
                maxRetriesPerRequest: 1,
                autoResubscribe : false,
                connectTimeout : 2000
            });
            client.on("error", (err) => {
                resolve(null);
            });
            client.on("close", (err) => {
                resolve(null);
            });
            client.on("ready", () => {
                instance = client;
                resolve(client);
            });
            client.on("reconnecting", () => {
                resolve(null);
            });
            client.on('end', () => {
                resolve(null);
            });
        });
    };

    const promiseGet = (key) => {
        return new Promise(async resolve => {
            const client = await getClient();
            if (!client) {
                return resolve({client: null, value: null});
            }
            client.get(key, function (err, res) {
                if (err) {
                    console.log("ERROR GETTING", err);
                    client.quit();
                    return resolve({client: null, value: null})
                }
                resolve({client, value: res});
            })
        })
    };

    return {
        get: async (key, fallback) => {
            const result = await promiseGet(key);
            if (!result.value) {
                return fallback ? await fallback() : null;
            }
            return JSON.parse(result.value);
        },
        getAndSet: async (key, fallback, expiration = 86400) => {
            const result = await promiseGet(key);
            if (!result.value) {
                const value = await fallback();
                if (result.client && value) {
                    result.client.set(key, JSON.stringify(result), 'EX', expiration);
                }
                return value;
            }
            return JSON.parse(result.value);
        },
        remove: async (key) => {
            const client = await getClient();
            if (!client) {
                return;
            }
            client.del(key);
        },
        set: async (key, value) => {
            const client = await getClient();
            if (!client) {
                return;
            }
            await client.set(key, JSON.stringify(value))
        },
        cleanup: () => {
            if (instance) {
                instance.quit();
            }
        }
    }
})();

module.exports = Redis;