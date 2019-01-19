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
                console.log(err);
                instance = null;
                resolve(null);
            });
            client.on("close", (err) => {
                console.log(err);
                instance = null;
                resolve(null);
            });
            client.on("ready", () => {
                instance = client;
                resolve(client);
            });
            client.on("reconnecting", () => {
                instance = null;
                resolve(null);
            });
            client.on('end', () => {
                instance = null;
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

    const promiseHashGet = (key) => {
        return new Promise(async resolve => {
            const client = await getClient();
            if (!client) {
                return resolve({client: null, value: null});
            }
            client.smembers(key, function (err, res) {
                if (err) {
                    console.log("ERROR GETTING", key, err);
                    client.quit();
                    return resolve({client: null, value: null})
                }
                resolve({client, value: res});
            })
        })
    };

    return {
        getInstance : async () => {
          return await getClient();  
        },
        isAlive : async () => {
            return await getClient() != null;  
        },
        get: async (key, fallback) => {
            const result = await promiseGet(key);
            if (!result.value) {
                return fallback ? await fallback() : null;
            }
            console.log("PULLING FROM REDIS", key);
            return JSON.parse(result.value);
        },
        getAndSet: async (key, fallback, expiration = 86400) => {
            const result = await promiseGet(key);
            if (!result.value) {
                const value = await fallback();
                if (result.client && value) {
                    result.client.set(key, JSON.stringify(value), 'EX', expiration);
                }
                return value;
            }
            return JSON.parse(result.value);
        },
        hashSetGetAndSet: async (key, fallback, expiration = 86400) => {
            const result = await promiseHashGet(key);
            if (!result.value && fallback != null) {
                const value = await fallback();
                if (result.client && value) {
                    result.client.set(key, JSON.stringify(value), 'EX', expiration);
                }
                return value;
            }
            return result.value;
        },
        increment : async (key) => {
            const client = await getClient();
            if (!client) {
                return;
            }
            return await new Promise((resolve, reject) => {
                client.incr(key, (err, value) => {
                    err ? reject(err) : resolve(value);
                });
            })
        },
        expire : async (key, seconds) => {
            const client = await getClient();
            if (!client) {
                return;
            }
            client.expire(key, seconds)
        },
        remove: async (key) => {
            const client = await getClient();
            if (!client) {
                return;
            }
            client.del(key);
        },
        set: async (key, value, expiration = 86400) => {
            const client = await getClient();
            if (!client) {
                return false;
            }
            return new Promise(res => {
                client.set(key, JSON.stringify(value), 'EX', expiration, function (err) {
                    if(err) {
                        console.log(err);
                    }
                    return res(err == null);
                });
            });
        },
        setAdd : async (key, value) => {
            console.log("SET ADD", key, value);
            const client = await getClient();
            if (!client) {
                return false;
            }
            return new Promise(res => {
                client.sadd(key, value, function (err) {
                    if(err) {
                        console.log(err);
                    }
                    return res(err == null);
                });
            });
        },
        cleanup: () => {
            if (instance) {
                try {
                    instance.quit();
                } catch (ignored) {
                    
                }
            }
        }
    }
})();

module.exports = Redis;